import { describe, expect, it } from "vitest";
import { isRtl, LANGS, matchLang, parseLinkFragment } from "../languages";
import en from "./en";
import enLegal from "./legal/en";
import { loadDict, loadLegal } from "./loaders";
import type { Block, LegalDoc } from "./legal/types";

const kind = (b: Block) => ("h" in b ? "h" : "p" in b ? "p" : `ul${b.ul.length}`);
const texts = (d: LegalDoc) => d.blocks.flatMap((b) => ("h" in b ? [b.h] : "p" in b ? [b.p] : b.ul));
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe.each(LANGS.map((l) => l.code))("language %s", (code) => {
  it("has every UI string, none empty", async () => {
    const d = await loadDict(code);
    expect(Object.keys(d).sort()).toEqual(Object.keys(en).sort());
    for (const [k, v] of Object.entries(d)) expect(v.trim(), k).not.toBe("");
  });

  it("keeps the Privacy and Terms structure and markup", async () => {
    const legal = await loadLegal(code);
    for (const doc of ["privacy", "terms"] as const) {
      expect(legal[doc].blocks.map(kind), doc).toEqual(enLegal[doc].blocks.map(kind));
      const a = texts(enLegal[doc]);
      const b = texts(legal[doc]);
      a.forEach((src, i) => {
        // The email token, the `#` / `/m/[id]` code spans and the cipher name must survive translation.
        expect(count(b[i], /\{email\}/g), `${doc} #${i} email`).toBe(count(src, /\{email\}/g));
        expect(count(b[i], /`/g), `${doc} #${i} code spans`).toBe(count(src, /`/g));
        if (src.includes("AES-256-GCM")) expect(b[i], `${doc} #${i} cipher name`).toContain("AES-256-GCM");
      });
    }
  });
});

describe("language helpers", () => {
  it("matches browser tags", () => {
    expect(matchLang("mr-IN")).toBe("mr");
    expect(matchLang("kok")).toBe("kok");
    expect(matchLang("fr-FR")).toBeNull();
  });
  it("flags right-to-left scripts", () => {
    expect(["ur", "ks", "sd"].every((c) => isRtl(c as never))).toBe(true);
    expect(isRtl("hi")).toBe(false);
  });
  it("reads the key and optional language from a link fragment", () => {
    const key = "A".repeat(43);
    expect(parseLinkFragment(`#${key}.mr`)).toEqual({ key, lang: "mr" });
    expect(parseLinkFragment(`#${key}`)).toEqual({ key, lang: null });
    expect(parseLinkFragment(`#${key}.xx`)).toEqual({ key, lang: null });
  });
});
