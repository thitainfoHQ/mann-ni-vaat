import type { Metadata, Viewport } from "next";
import { isRtl, LANGS, type Lang } from "./languages";
import { siteUrl } from "./site";

export const viewport: Viewport = { themeColor: "#15143a", width: "device-width", initialScale: 1 };

const description = "Send a secret message or drawing that opens once and then disappears. Encrypted in your browser.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mann Ni Vaat · મનની વાત",
  description,
  icons: { icon: "/favicon.ico" },
  openGraph: { title: "Mann Ni Vaat · મનની વાત", description, siteName: "Mann Ni Vaat", type: "website" },
  twitter: { card: "summary_large_image", title: "Mann Ni Vaat", description },
};

/** Languages that have their own home page (everything except English, which lives at "/", and unfinished drafts). */
export const HOME_LANGS = LANGS.filter((l) => l.code !== "en" && !("draft" in l && l.draft)).map((l) => l.code);

export const homePath = (lang: Lang) => (lang === "en" ? "/" : `/${lang}`);

/** hreflang links so search engines connect the language versions of the home page. */
export function homeAlternates(): Record<string, string> {
  return { en: "/", ...Object.fromEntries(HOME_LANGS.map((l) => [l, `/${l}`])), "x-default": "/" };
}

export const dirFor = (lang: Lang) => (isRtl(lang) ? "rtl" : "ltr");
