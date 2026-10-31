import { describe, expect, it } from "vitest";
import en from "@/lib/locales/en";
import hi from "@/lib/locales/hi";
import { titleFor } from "./Shell";

describe("tab titles", () => {
  it("follow the page and the language", () => {
    expect(titleFor("/new", en, "en")).toBe("Create secret link · Mann Ni Vaat");
    expect(titleFor("/mine", hi, "hi")).toContain("Mann Ni Vaat");
    expect(titleFor("/m/abc", en, "en")).toContain("A secret is waiting for you");
    expect(titleFor("/safety", en, "en")).toBe("Safety · Mann Ni Vaat");
  });

  it("leaves the English home and the occasion pages to the server", () => {
    expect(titleFor("/", en, "en")).toBeNull();
    expect(titleFor("/for/birthday", en, "en")).toBeNull();
  });

  it("titles a translated home", () => {
    expect(titleFor("/", hi, "hi")).toBe(`${hi.tagline} · Mann Ni Vaat`);
    expect(titleFor("/hi", hi, "hi")).toBe(`${hi.tagline} · Mann Ni Vaat`);
  });
});
