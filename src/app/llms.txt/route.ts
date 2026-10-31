import { OCCASIONS } from "@/lib/occasions";
import { HOME_LANGS } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// A plain-text summary for AI assistants and answer engines (the llms.txt convention). Keep it factual and in step
// with what the site really does; the same facts appear on the home page.
export function GET() {
  const base = siteUrl.replace(/\/$/, "");
  const body = `# Mann Ni Vaat

> Mann Ni Vaat (મનની વાત) is a free website for sending a secret text message or drawing that can be opened only once. The message is encrypted in the sender's browser, so the service cannot read it, and it is deleted when opened. No account or app is needed.

## Key facts

- Encryption happens in the sender's browser (AES-256-GCM). The key is in the part of the link after the "#", which browsers never send to servers.
- A secret opens exactly once. The server deletes it in the same step that hands it out. Unopened secrets are deleted after 7 days.
- Optional extras: a secret phrase the receiver must also type, a scheduled reveal up to 4 days ahead, and a choice of looks (Classic, Diwali, Birthday, Anniversary, Sorry, I miss you).
- Works in English and ${HOME_LANGS.length} Indian languages (${HOME_LANGS.join(", ")}).
- Free to use. For learning, education and entertainment.
- Limits: it cannot stop screenshots or photos of the screen, and anyone with the link (and the phrase, if set) can open it once.

## Pages

- [Home](${base}/): what it is, how it works, and answers to common questions
- [Send a secret](${base}/new): write a message or draw a picture and get a link
- [Safety](${base}/safety): staying safe, what is not allowed, how to report
- [Privacy Policy](${base}/privacy)
- [Terms of Use](${base}/terms)
${OCCASIONS.map((o) => `- [${o.label}](${base}/for/${o.slug}): ${o.metaDescription}`).join("\n")}

## Languages

The home page is available in each language at ${base}/<code>, for example ${base}/hi (Hindi) and ${base}/gu (Gujarati).

## Contact

info@thitainfo.com
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
