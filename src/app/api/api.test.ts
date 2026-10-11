import { beforeEach, describe, expect, it } from "vitest";
import { POST as create } from "./create/route";
import { GET as meta } from "./meta/[id]/route";
import { POST as open } from "./open/[id]/route";
import { __setStore, MemoryStore } from "@/lib/store";
import { decryptPayload, encryptPayload, generateLinkKey } from "@/lib/crypto";

const post = (body: unknown, ip = "1.1.1.1") =>
  new Request("http://x/api/create", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) }) as never;

beforeEach(() => __setStore(new MemoryStore()));

async function make(passphrase?: string, hint?: string) {
  const key = generateLinkKey();
  const blob = await encryptPayload({ v: 1, kind: "text", lang: "en", text: "hello" }, key, passphrase);
  const res = await create(post({ ct: blob.ct, salt: blob.salt, hint }));
  return { key, blob, res, id: ((await res.clone().json()) as { id?: string }).id! };
}

describe("burn on open", () => {
  it("returns the ciphertext once, then it is gone", async () => {
    const { key, id, blob } = await make();
    const first = await open(new Request("http://x", { method: "POST" }), ctx(id));
    expect(first.status).toBe(200);
    const { ct } = (await first.json()) as { ct: string };
    expect(await decryptPayload({ ct }, key)).toMatchObject({ text: "hello" });
    expect(ct).toBe(blob.ct);

    const second = await open(new Request("http://x", { method: "POST" }), ctx(id));
    expect(second.status).toBe(404);
    expect((await meta(new Request("http://x"), ctx(id))).status).toBe(404);
  });

  it("parallel opens: exactly one wins", async () => {
    const { id } = await make();
    const rs = await Promise.all(
      Array.from({ length: 10 }, () => open(new Request("http://x", { method: "POST" }), ctx(id))),
    );
    expect(rs.filter((r) => r.status === 200)).toHaveLength(1);
  });
});

describe("meta", () => {
  it("does not burn, and exposes only public fields", async () => {
    const { id } = await make("phrase", "our trip");
    for (let i = 0; i < 3; i++) {
      const r = await meta(new Request("http://x"), ctx(id));
      expect(r.status).toBe(200);
      expect(await r.json()).toMatchObject({ exists: true, hasPassphrase: true, hint: "our trip" });
    }
    expect((await open(new Request("http://x", { method: "POST" }), ctx(id))).status).toBe(200);
  });

  it("rejects malformed ids", async () => {
    expect((await meta(new Request("http://x"), ctx("nope"))).status).toBe(404);
    expect((await open(new Request("http://x", { method: "POST" }), ctx("../../etc"))).status).toBe(404);
  });
});

describe("create validation", () => {
  it("rejects junk, oversize and hint without passphrase", async () => {
    expect((await create(post({ ct: "short" }))).status).toBe(400);
    expect((await create(post({ ct: "!!!!!!!!!!!!!!!!!!!!!!!!" }))).status).toBe(400);
    expect((await create(post({ ct: "A".repeat(900_000) }))).status).toBe(400);
    expect((await create(post({ ct: "A".repeat(40), hint: "x" }))).status).toBe(400);
    expect((await create(post("nope"))).status).toBe(400);
  });

  it("rate limits per IP", async () => {
    const ct = "A".repeat(40);
    let last = 0;
    for (let i = 0; i < 31; i++) last = (await create(post({ ct }, "9.9.9.9"))).status;
    expect(last).toBe(429);
    expect((await create(post({ ct }, "8.8.8.8"))).status).toBe(201);
  });

  it("rejects an oversized body by Content-Length without reading it", async () => {
    const req = new Request("http://x/api/create", {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": "2000000" },
      body: JSON.stringify({ ct: "A".repeat(40) }),
    });
    expect((await create(req)).status).toBe(413);
  });
});

describe("read endpoint rate limits", () => {
  const withIp = (ip: string, method = "GET") =>
    new Request("http://x", { method, headers: { "x-forwarded-for": ip } });

  it("limits meta lookups per IP", async () => {
    const { id } = await make();
    let last = 0;
    for (let i = 0; i < 301; i++) last = (await meta(withIp("7.7.7.7"), ctx(id))).status;
    expect(last).toBe(429);
    expect((await meta(withIp("6.6.6.6"), ctx(id))).status).toBe(200);
  });

  it("limits open attempts per IP", async () => {
    let last = 0;
    for (let i = 0; i < 121; i++) last = (await open(withIp("5.5.5.5", "POST"), ctx("A".repeat(22)))).status;
    expect(last).toBe(429);
  });
});
