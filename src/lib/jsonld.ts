import { CONTACT_EMAIL } from "./config";
import type { Lang } from "./languages";
import type { HomeContent } from "./locales/home/types";
import { HOME_LANGS } from "./seo";
import { siteUrl } from "./site";

/**
 * schema.org structured data for a home page: who we are, what the site is, and (when the page shows one)
 * its FAQ. Everything here is also visible on the page; nothing is claimed that the page does not say.
 */
export function homeJsonLd(opts: { lang: Lang; path: string; description: string; faq?: HomeContent["faq"] }) {
  const base = siteUrl.replace(/\/$/, "");
  const orgId = `${base}/#organization`;
  const pageUrl = `${base}${opts.path === "/" ? "" : opts.path}`;

  const graph: object[] = [
    {
      "@type": "Organization",
      "@id": orgId,
      name: "Mann Ni Vaat",
      url: base,
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL },
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: base,
      name: "Mann Ni Vaat",
      inLanguage: ["en", ...HOME_LANGS],
      publisher: { "@id": orgId },
    },
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#app`,
      name: "Mann Ni Vaat",
      url: pageUrl,
      description: opts.description,
      applicationCategory: "CommunicationApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript and a modern browser",
      isAccessibleForFree: true,
      inLanguage: opts.lang,
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      featureList: [
        "Send a secret text message or drawing that opens only once",
        "Encrypted in the browser with AES-256-GCM; the key never reaches the server",
        "Deleted when opened, or after 7 days if unopened",
        "Optional secret phrase and scheduled reveal up to 4 days ahead",
        "No account or app needed",
      ],
      publisher: { "@id": orgId },
    },
  ];

  if (opts.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      inLanguage: opts.lang,
      mainEntity: opts.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
