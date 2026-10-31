# Mann Ni Vaat (મનની વાત)

Send a secret message or drawing that opens once and then disappears. Built for Navratri 2026, for learning, education and entertainment.

- Encrypted in the sender's browser (AES-256-GCM). The key lives in the link after the `#`, so the server never sees it.
- Opens exactly once. The server deletes the ciphertext in the same step that hands it out.
- Unopened secrets expire after 7 days.
- Optional secret phrase (PBKDF2 + HKDF) that the receiver needs on top of the link.
- 23 languages: English plus the 22 languages of India's Eighth Schedule (see below). Privacy and Terms are translated too.

See [SPEC.md](./SPEC.md) for the full design.

## Run it

**Always run `yarn build` before pushing.** `yarn dev` does not catch prerender errors (for example reading `Date.now()` or `usePathname()` outside Suspense in a client component), and they only fail on Vercel.

```bash
yarn install
yarn dev        # http://localhost:3000, uses an in-memory store
yarn test       # crypto + API tests
yarn build      # production build
```

In development, secrets are kept in memory, so no Redis is needed. A production build refuses to start storing secrets without Redis.

To try a production build locally without Redis: `ALLOW_MEMORY_STORE=1 yarn start`. Never set this on a real deployment.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis. The Vercel Marketplace integration adds these for you. |
| `NEXT_PUBLIC_SITE_URL` | Public address (`https://mannivaat.in`), used for the link-preview image. |

## Deploy (Vercel + Upstash)

1. Import this repo in Vercel.
2. Add the Upstash Redis integration from the Vercel Marketplace and connect it to the project.
3. Add the domain `mannivaat.in` in Vercel (Project Settings, Domains) and set the DNS records it shows at your registrar.
4. Set `NEXT_PUBLIC_SITE_URL` to `https://mannivaat.in`.
5. Deploy, then send and open a secret on the live site with two different devices.

## How the flow works

1. The sender's browser encrypts the message and posts only the ciphertext to `POST /api/create`.
2. The receiver opens `/m/<id>#<key>`. The page calls `GET /api/meta/<id>` (never deletes anything, so link-preview bots are harmless).
3. Tapping "Untie the knot" calls `POST /api/open/<id>`, which atomically returns and deletes the ciphertext. The browser decrypts it locally.

## Scheduled reveal, looks and My secrets

- **Scheduled reveal:** the sender can pick a time up to 4 days ahead. The opening time is stored (unencrypted) in the secret's meta, and `POST /api/open` answers `425` without burning the secret until then. The receiver sees a countdown that follows the server's clock. The limit is 4 days because a secret still expires 7 days after creation, which keeps the Privacy Policy true; raising it means changing that text in every language.
- **Looks:** Classic, Diwali, Birthday, Anniversary, Sorry, I miss you. They only recolour the cloth. The look travels in the link fragment (`#key.lang.theme`), so the server never learns the occasion. Add a theme in `src/lib/themes.ts`, `globals.css` and the `theme*` strings.
- **My secrets (`/mine`):** a list kept only in the sender's browser (localStorage `mnv-sent`). Waiting secrets keep their link so it can be copied or shared again; once the server no longer has one it is marked Opened (or "Opened or expired" after 7 days) and its link is dropped. Finished entries are removed after 30 days. Status comes from the same `GET /api/meta/<id>` a receiver uses.

## Languages

English, Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri (Meitei), Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu.

- UI text lives in `src/lib/locales/<code>.ts` and the Privacy/Terms text in `src/lib/locales/legal/<code>.ts`. English is the source of truth; `yarn test` fails if a language misses a string or changes the legal structure.
- Each language is its own chunk, loaded only when chosen. Fonts for each script are only downloaded when that script appears on screen.
- Urdu, Kashmiri and Sindhi switch the page to right-to-left.
- **SEO and answer engines (GEO):**
  - The home page shows a "How it works" section and an FAQ, as real visible text, and the same FAQ as `FAQPage` structured data; Organization, WebSite and WebApplication data is included too (`src/lib/jsonld.ts`). Text lives in `src/lib/locales/home/<code>.ts`; only English, Hindi and Gujarati exist so far, and other languages show no such section (rather than English on a translated page).
  - `/for/birthday`, `/for/anniversary`, `/for/diwali`, `/for/sorry`, `/for/miss-you` are English landing pages that open the composer with the matching look (`src/lib/occasions.ts`).
  - `/llms.txt` summarises the site for AI assistants. Keep its facts in step with the product. `robots.txt` allows all crawlers except for private paths; add AI-crawler rules there if you ever want to opt out of model training.
  - After launch: set `NEXT_PUBLIC_SITE_URL`, submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- **Per-language home pages** for search: English at `/`, every finished language at `/hi`, `/gu`, `/mr`, ... (drafts get none). They are static and server-rendered in that language, with its own title, description, canonical URL and `hreflang` links, listed in `/sitemap.xml`. `/en` redirects to `/`. The language picker moves between these addresses on the home pages; everywhere else (`/new`, `/m/<id>`, ...) the address never changes. `robots.txt` hides `/m/`, `/mine` and `/api/`.
- Secret links look like `/m/<id>#<key>.<lang>`. The sender's language becomes the receiver's default (a language the receiver already chose wins).
- **Draft languages** (`draft: true` in `src/lib/languages.ts`): Bodo, Kashmiri, Santali and Manipuri are hidden from the picker until a native speaker has written or checked them (Santali and Manipuri are still English placeholders). Set `NEXT_PUBLIC_SHOW_DRAFT_LANGS=1` to see them.
- All translations, including Hindi and Gujarati, should be reviewed by native speakers before launch.

## Visual design

The idea is a letter tied in a potli (bandhani bundle). A night-sky page with a faint diya glow; the **paper** (`.paper`, `.ruled` in `globals.css`) is the only light surface and is used for the message; the **torana** (`.torana`, a string of bandhani dots) divides header and footer; the cloth has a sheen and a shorter `compact` form for the home page. The composer keeps the message first and folds look, secret phrase and schedule into one quiet list (`Row` in `Composer.tsx`). Fonts stay Baloo/Hind because they cover the scripts we support; change the scale, not the families. Check any layout change with a long-script language (Malayalam, Tamil) and a right-to-left one (Urdu).

On a wide screen the home page is two columns (headline, buttons and occasion chips beside the tying demo), then an "Everything in one place" grid of feature tiles that link into the app, the steps, the FAQ in two columns, a grid of every language (each links to its own home page), and a "share Mann Ni Vaat" band. The footer lists every page. All other pages stay one readable column (`src/app/(app)/(inner)/layout.tsx`). No third-party ads: this is a privacy product.

The home page opens on a sample letter that the cloth then ties itself over (skipped for reduced motion), shows occasion chips ("What will you say?") that open the composer with that look, and gives returning senders a "My secrets" link with a count.

## Look and feel details

- **Icons:** the knot logo is `src/app/icon.svg` (also exported as `src/app/favicon.ico`, `src/app/apple-icon.png`, `public/icon-192.png` and `public/icon-512.png`). Re-export the PNG/ICO from the SVG if you change the logo. `src/app/manifest.ts` lets people add the site to their home screen.
- **Tab titles** follow the page and the chosen language (`titleFor` in `src/components/Shell.tsx`), including when the language is switched in place.
- **Loading** shows the turning knot (`Loading`) instead of plain text or a blank page; the `<html>` background is set inline so there is no white flash. Unknown addresses show the app's own 404 (`global-not-found.tsx`, an experimental Next flag, plus `not-found.tsx` inside each layout). `/en` redirects to `/` from `next.config.ts`.

## Safety and reports

- The receiver page warns that anyone can send a secret and nobody can tell who (never share OTPs, passwords or money). `/safety` explains how to stay safe and how to report.
- After opening a secret, the receiver can tap **Report this secret**, pick a reason and send it to us. Only then do we receive the content, and nothing identifying goes with it. `POST /api/report` is rate limited (10 per IP per hour).
- Reports are stored in Redis as `report:<timestamp>:<random>` keys with a 60-day expiry. Read them in the Upstash console (Data Browser, search `report:*`). Memory store (dev) keeps them in `store.reports`.
- Review reports regularly and block abusers (Vercel Firewall IP rules). Add a named grievance contact if your legal advice calls for one.

## What it cannot do

It cannot stop screenshots or someone photographing the screen. Anyone with the link (and the phrase, if set) can open it, once. The Privacy Policy and Terms say this plainly.

## Notes

- Every non-English translation should be reviewed by a native speaker (see Languages).
- This repo is public, so never commit `.env*` files with real values.
