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
- **Per-language home pages** for search: English at `/`, every finished language at `/hi`, `/gu`, `/mr`, ... (drafts get none). They are static and server-rendered in that language, with its own title, description, canonical URL and `hreflang` links, listed in `/sitemap.xml`. `/en` redirects to `/`. The language picker moves between these addresses on the home pages; everywhere else (`/new`, `/m/<id>`, ...) the address never changes. `robots.txt` hides `/m/`, `/mine` and `/api/`.
- Secret links look like `/m/<id>#<key>.<lang>`. The sender's language becomes the receiver's default (a language the receiver already chose wins).
- **Draft languages** (`draft: true` in `src/lib/languages.ts`): Bodo, Kashmiri, Santali and Manipuri are hidden from the picker until a native speaker has written or checked them (Santali and Manipuri are still English placeholders). Set `NEXT_PUBLIC_SHOW_DRAFT_LANGS=1` to see them.
- All translations, including Hindi and Gujarati, should be reviewed by native speakers before launch.

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
