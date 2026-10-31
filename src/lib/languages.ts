import { isTheme, type Theme } from "./themes";

// The 22 languages of India's Eighth Schedule, plus English. `name` is written in the language's own script.
export const LANGS = [
  { code: "en", name: "English" },
  { code: "as", name: "অসমীয়া" },
  { code: "bn", name: "বাংলা" },
  { code: "brx", name: "बड़ो", draft: true },
  { code: "doi", name: "डोगरी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "hi", name: "हिन्दी" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ks", name: "کٲشُر", rtl: true, draft: true },
  { code: "kok", name: "कोंकणी" },
  { code: "mai", name: "मैथिली" },
  { code: "ml", name: "മലയാളം" },
  { code: "mni", name: "ꯃꯩꯇꯩꯂꯣꯟ", draft: true },
  { code: "mr", name: "मराठी" },
  { code: "ne", name: "नेपाली" },
  { code: "or", name: "ଓଡ଼ିଆ" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "sa", name: "संस्कृतम्" },
  { code: "sat", name: "ᱥᱟᱱᱛᱟᱲᱤ", draft: true },
  { code: "sd", name: "سنڌي", rtl: true },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ur", name: "اردو", rtl: true },
] as const satisfies readonly { code: string; name: string; rtl?: boolean; draft?: boolean }[];

export type Lang = (typeof LANGS)[number]["code"];

const CODES = new Set<string>(LANGS.map((l) => l.code));
export const isLang = (v: unknown): v is Lang => typeof v === "string" && CODES.has(v);
/**
 * `draft` languages are written but not yet checked by a native speaker (or still English placeholders).
 * They stay out of the picker and out of automatic detection, unless NEXT_PUBLIC_SHOW_DRAFT_LANGS=1.
 */
const isDraft = (code: Lang) => LANGS.some((l) => l.code === code && "draft" in l && l.draft);
const showDrafts = process.env.NEXT_PUBLIC_SHOW_DRAFT_LANGS === "1";
export const PICKER_LANGS = LANGS.filter((l) => showDrafts || !("draft" in l && l.draft));

export const isRtl = (code: Lang) => LANGS.some((l) => l.code === code && "rtl" in l && l.rtl);

/** Maps a browser language tag such as "mr-IN" or "kok" to a supported language. */
export function matchLang(tag: string): Lang | null {
  const base = tag.toLowerCase().split("-")[0];
  return isLang(base) && (showDrafts || !isDraft(base)) ? base : null;
}

/**
 * Secret links look like `#<key>`, `#<key>.<lang>` or `#<key>.<lang>.<theme>`. The key is base64url, so "." can't
 * appear in it. The language and theme only choose how the receiver's page looks; neither is secret.
 */
export function parseLinkFragment(hash: string): { key: string; lang: Lang | null; theme: Theme } {
  const [key, lang, theme] = hash.replace(/^#/, "").split(".");
  return { key, lang: isLang(lang) ? lang : null, theme: isTheme(theme) ? theme : "classic" };
}
