import { describe, expect, it } from "vitest";
import { decryptPayload, encryptPayload, generateLinkKey, type Payload } from "./crypto";

const text: Payload = { v: 1, kind: "text", lang: "gu", text: "તને એક વાત કહું? 🪔" };

describe("crypto round trip", () => {
  it("encrypts and decrypts text (unicode) with the link key only", async () => {
    const key = generateLinkKey();
    const blob = await encryptPayload(text, key);
    expect(blob.salt).toBeUndefined();
    expect(blob.ct).not.toContain("વાત");
    expect(await decryptPayload(blob, key)).toEqual(text);
  });

  it("round-trips a large drawing payload", async () => {
    const key = generateLinkKey();
    const image = "data:image/webp;base64," + "A".repeat(300_000);
    const p: Payload = { v: 1, kind: "drawing", lang: "en", image };
    expect(await decryptPayload(await encryptPayload(p, key), key)).toEqual(p);
  });

  it("fails with a different link key", async () => {
    const blob = await encryptPayload(text, generateLinkKey());
    await expect(decryptPayload(blob, generateLinkKey())).rejects.toThrow();
  });

  it("uses a fresh IV each time", async () => {
    const key = generateLinkKey();
    const a = await encryptPayload(text, key);
    const b = await encryptPayload(text, key);
    expect(a.ct).not.toEqual(b.ct);
  });

  it("detects tampering", async () => {
    const key = generateLinkKey();
    const blob = await encryptPayload(text, key);
    const flipped = blob.ct.slice(0, -2) + (blob.ct.endsWith("AA") ? "BB" : "AA");
    await expect(decryptPayload({ ...blob, ct: flipped }, key)).rejects.toThrow();
  });

  it("pads short messages to the same size bucket", async () => {
    const key = generateLinkKey();
    const a = await encryptPayload({ ...text, text: "hi" } as Payload, key);
    const b = await encryptPayload({ ...text, text: "a longer secret, still short" } as Payload, key);
    expect(a.ct.length).toEqual(b.ct.length);
  });
});

describe("passphrase", () => {
  it("decrypts with link key + correct phrase", async () => {
    const key = generateLinkKey();
    const blob = await encryptPayload(text, key, "our first trip");
    expect(blob.salt).toBeTruthy();
    expect(await decryptPayload(blob, key, "our first trip")).toEqual(text);
  });

  it("fails with the wrong phrase, or no phrase", async () => {
    const key = generateLinkKey();
    const blob = await encryptPayload(text, key, "right phrase");
    await expect(decryptPayload(blob, key, "wrong phrase")).rejects.toThrow();
    await expect(decryptPayload(blob, key)).rejects.toThrow();
  });

  it("fails with the right phrase but wrong link key", async () => {
    const blob = await encryptPayload(text, generateLinkKey(), "phrase");
    await expect(decryptPayload(blob, generateLinkKey(), "phrase")).rejects.toThrow();
  });
});
