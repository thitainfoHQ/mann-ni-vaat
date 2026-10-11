import { describe, expect, it } from "vitest";
import { sanitizeUrl } from "./analytics";

describe("sanitizeUrl", () => {
  it("removes the key fragment and the secret id", () => {
    const out = sanitizeUrl("https://mannivaat.in/m/nIrGmdDZwL2R5FQwkSBJlg#G0D0s6BHgOEQ97YDUGDLAtgn24B5EaAO0pYben5g724");
    expect(out).toBe("https://mannivaat.in/m/[id]");
    expect(out).not.toContain("nIrGmd");
    expect(out).not.toContain("G0D0s6");
  });

  it("removes query strings", () => {
    expect(sanitizeUrl("https://mannivaat.in/new?type=drawing&x=1#frag")).toBe("https://mannivaat.in/new");
  });

  it("leaves ordinary pages alone", () => {
    expect(sanitizeUrl("https://mannivaat.in/privacy")).toBe("https://mannivaat.in/privacy");
  });

  it("returns an empty string for junk instead of leaking it", () => {
    expect(sanitizeUrl("not a url #secretkey")).toBe("");
  });
});
