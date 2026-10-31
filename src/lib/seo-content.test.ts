import { describe, expect, it } from "vitest";
import { homeJsonLd } from "./jsonld";
import { loadHomeContent } from "./locales/homeContent";
import { OCCASIONS } from "./occasions";
import { HOME_LANGS } from "./seo";
import { isTheme } from "./themes";

describe("home page content", () => {
  it("keeps Hindi and Gujarati in step with English", async () => {
    const en = await loadHomeContent("en");
    expect(en).not.toBeNull();
    for (const code of ["hi", "gu"] as const) {
      const c = await loadHomeContent(code);
      expect(c?.steps).toHaveLength(en!.steps.length);
      expect(c?.faq).toHaveLength(en!.faq.length);
    }
  });

  it("says nothing for languages without a translation", async () => {
    expect(await loadHomeContent("mr")).toBeNull();
  });

  it("states the real number of Indian languages", async () => {
    const en = await loadHomeContent("en");
    expect(en!.faq[0].a).toContain(`${HOME_LANGS.length} Indian languages`);
  });
});

describe("structured data", () => {
  it("includes an FAQ only when the page has one", () => {
    const withFaq = homeJsonLd({ lang: "en", path: "/", description: "d", faq: [{ q: "Q?", a: "A." }] });
    const without = homeJsonLd({ lang: "mr", path: "/mr", description: "d" });
    const types = (j: ReturnType<typeof homeJsonLd>) => j["@graph"].map((n) => (n as { "@type": string })["@type"]);
    expect(types(withFaq)).toContain("FAQPage");
    expect(types(without)).not.toContain("FAQPage");
    expect(types(without)).toEqual(expect.arrayContaining(["Organization", "WebSite", "WebApplication"]));
  });
});

describe("occasion pages", () => {
  it("have unique slugs, a real theme and search-friendly lengths", () => {
    expect(new Set(OCCASIONS.map((o) => o.slug)).size).toBe(OCCASIONS.length);
    for (const o of OCCASIONS) {
      expect(isTheme(o.theme), o.slug).toBe(true);
      expect(o.metaTitle.length, `${o.slug} title`).toBeLessThanOrEqual(65);
      expect(o.metaDescription.length, `${o.slug} description`).toBeLessThanOrEqual(165);
      expect(o.ideas).toHaveLength(3);
    }
  });
});
