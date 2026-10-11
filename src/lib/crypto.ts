// End-to-end encryption helpers. Runs in the browser and in Node (Web Crypto).
// The server only ever sees `EncryptedBlob`; the link key lives in the URL fragment.

export type Payload =
  | { v: 1; kind: "text"; lang: string; text: string }
  | { v: 1; kind: "drawing"; lang: string; image: string };

export type EncryptedBlob = {
  ct: string; // base64url(iv || ciphertext)
  salt?: string; // base64url, only when a passphrase is used (public)
};

const PBKDF2_ITERATIONS = 600_000;
const IV_BYTES = 12;
const SALT_BYTES = 16;
const LINK_KEY_BYTES = 32;
const MIN_BUCKET = 1024;
const HKDF_INFO = new TextEncoder().encode("mann-ni-vaat/v1");

export const MAX_CIPHERTEXT_CHARS = 850_000;

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function generateLinkKey(): string {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(LINK_KEY_BYTES)));
}

async function deriveKey(
  linkKey: string,
  passphrase: string | undefined,
  salt: Uint8Array | undefined,
): Promise<CryptoKey> {
  const linkBytes = b64urlDecode(linkKey);
  if (linkBytes.length !== LINK_KEY_BYTES) throw new Error("Invalid link key");

  let material = linkBytes;
  if (passphrase) {
    if (!salt) throw new Error("Missing salt");
    const base = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase.normalize("NFKC")),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const passBits = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS },
        base,
        256,
      ),
    );
    material = new Uint8Array(linkBytes.length + passBits.length);
    material.set(linkBytes);
    material.set(passBits, linkBytes.length);
  }

  const hkdfBase = await crypto.subtle.importKey("raw", material as BufferSource, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: HKDF_INFO },
    hkdfBase,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// Length-prefixed padding into size buckets so ciphertext size leaks less.
function bucketFor(n: number): number {
  if (n <= 65_536) {
    let b = MIN_BUCKET;
    while (b < n) b *= 2;
    return b;
  }
  return Math.ceil(n / 65_536) * 65_536;
}

function pad(plain: Uint8Array): Uint8Array {
  const total = bucketFor(plain.length + 4);
  const out = new Uint8Array(total);
  new DataView(out.buffer).setUint32(0, plain.length);
  out.set(plain, 4);
  return out;
}

function unpad(padded: Uint8Array): Uint8Array {
  const len = new DataView(padded.buffer, padded.byteOffset, padded.byteLength).getUint32(0);
  if (len + 4 > padded.length) throw new Error("Corrupt payload");
  return padded.subarray(4, 4 + len);
}

export async function encryptPayload(
  payload: Payload,
  linkKey: string,
  passphrase?: string,
): Promise<EncryptedBlob> {
  const salt = passphrase ? crypto.getRandomValues(new Uint8Array(SALT_BYTES)) : undefined;
  const key = await deriveKey(linkKey, passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const body = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, pad(enc.encode(JSON.stringify(payload))) as BufferSource),
  );
  const joined = new Uint8Array(iv.length + body.length);
  joined.set(iv);
  joined.set(body, iv.length);
  return { ct: b64urlEncode(joined), ...(salt ? { salt: b64urlEncode(salt) } : {}) };
}

// Throws on a wrong link key, wrong passphrase, or tampered data.
export async function decryptPayload(
  blob: EncryptedBlob,
  linkKey: string,
  passphrase?: string,
): Promise<Payload> {
  const salt = blob.salt ? b64urlDecode(blob.salt) : undefined;
  const key = await deriveKey(linkKey, passphrase, salt);
  const joined = b64urlDecode(blob.ct);
  if (joined.length <= IV_BYTES) throw new Error("Corrupt payload");
  const iv = joined.subarray(0, IV_BYTES);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, joined.subarray(IV_BYTES) as BufferSource),
  );
  const parsed = JSON.parse(dec.decode(unpad(plain))) as Payload;
  if (parsed.v !== 1 || (parsed.kind !== "text" && parsed.kind !== "drawing")) {
    throw new Error("Unsupported payload");
  }
  return parsed;
}
