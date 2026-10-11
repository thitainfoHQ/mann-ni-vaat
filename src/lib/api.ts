import { b64urlEncode, MAX_CIPHERTEXT_CHARS } from "./crypto";
import { getStore } from "./store";

export const ID_RE = /^[A-Za-z0-9_-]{22}$/;
const B64URL_RE = /^[A-Za-z0-9_-]+$/;
export const MAX_HINT = 80;
export const MAX_BODY_BYTES = 1_000_000;

/** Counts one hit per client per hour for `bucket`; true once `max` is exceeded. */
export async function rateLimited(req: Request, bucket: string, max: number): Promise<boolean> {
  return (await getStore().hit(`${bucket}:${clientIp(req)}`, 3600)) > max;
}

export function newId(): string {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(16)));
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export type CreateBody = { ct: string; salt?: string; hint?: string };

/** Returns a clean CreateBody or an error string. */
export function validateCreate(body: unknown): CreateBody | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const { ct, salt, hint } = body as Record<string, unknown>;
  if (typeof ct !== "string" || !B64URL_RE.test(ct) || ct.length < 20) return "Invalid message";
  if (ct.length > MAX_CIPHERTEXT_CHARS) return "Message is too large";
  if (salt !== undefined && (typeof salt !== "string" || !/^[A-Za-z0-9_-]{22}$/.test(salt))) return "Invalid salt";
  if (hint !== undefined && (typeof hint !== "string" || hint.length > MAX_HINT)) return "Hint is too long";
  if (hint && !salt) return "A hint needs a passphrase";
  return { ct, ...(salt ? { salt } : {}), ...(hint ? { hint: hint.trim() } : {}) };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
