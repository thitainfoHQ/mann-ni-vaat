# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Mann Ni Vaat (મનની વાત, live at mannivaat.in): send a secret text or drawing that is encrypted in the browser and can be opened exactly once. `SPEC.md` is the product/design source of truth; `README.md` covers deploy steps.

**Read `AGENTS.md` first.** This repo uses Next.js 16 with breaking changes from older versions. Check `node_modules/next/dist/docs/` before writing Next-specific code (routing, caching, `cacheComponents`, route handler `RouteContext`/`PageProps` types).

## Commands

Package manager is **yarn** (`yarn.lock`).

```bash
yarn dev                      # http://localhost:3000, in-memory store, no Redis needed
yarn build / yarn start       # production; refuses to run without Redis (see below)
yarn lint                     # eslint
yarn test                     # vitest run (all tests)
yarn vitest run src/lib/crypto.test.ts           # one file
yarn vitest run -t "returns the ciphertext once" # one test by name
npx tsc --noEmit              # type-check (not part of any script)
ALLOW_MEMORY_STORE=1 yarn start   # try a prod build locally without Redis; never on a real deploy
```

Tests are node-environment vitest; `@/` is aliased to `src/`. API tests call the route handlers directly with `Request` objects and swap the store via `__setStore(new MemoryStore())`.

- **Look:** dark night page; `.paper`/`.ruled` for the message letter (only light surface), `.torana` divider, themeable cloth (`--cloth-*`). Use logical Tailwind classes (`ps-`, `start-`, `text-start`) for right-to-left, and keep tap targets at least 44px.

## Routing layout (two root layouts)

- `src/app/(app)/` is the root layout for `/`, `/new`, `/m/[id]`, `/mine`, `/privacy`, `/terms`, `/safety` (language chosen in the browser).
- `src/app/[lang]/` is the root layout for the per-language home pages (`/hi`, `/gu`, ...): server-rendered in that language, seeded `LangProvider`, `hreflang`. `/en` redirects to `/`. Moving between the two root layouts is a full page load.
- Shared pieces: `RootDocument` (html/body/fonts/analytics), `src/lib/seo.ts`, `src/lib/site.ts`, `Home` component, `src/lib/og.tsx`.
- Each root layout needs its **own** `opengraph-image.tsx` (a file at `src/app/` root is not inherited by route groups). Both call `renderOgImage()`; keep the card free of anything about a secret.
- Icons live at `src/app/` root (`icon.svg`, `favicon.ico`, `apple-icon.png`) and are inherited by both root layouts, unlike `opengraph-image`. `next.config.ts` enables `experimental.globalNotFound` for `src/app/global-not-found.tsx`. `dynamicParams` is not allowed with `cacheComponents`; unknown `[lang]`/`[occasion]` values render the page, which calls `notFound()` (the `not-found.tsx` in each group shows the branded 404).
- **Run `yarn build` before pushing.** Dev mode misses prerender errors (`Date.now()` in render, `usePathname()` outside `<Suspense>`).

## Architecture

The security model drives the structure. Keep these invariants when changing anything:

- **The server never sees the key.** `src/lib/crypto.ts` (Web Crypto, runs in browser and Node) encrypts in the sender's browser. The 256-bit link key lives only in the URL fragment: `/m/<id>#<key>`. Optional passphrase: PBKDF2 → combined with link key via HKDF → AES-256-GCM, with size-bucket padding. The server only stores `ct` (+ public `salt`, `hint`).
- **Burn on open, safely.** Three routes in `src/app/api/`:
  - `POST /api/create` validates (`validateCreate` in `src/lib/api.ts`), rate-limits, stores with a 7-day TTL.
  - `GET /api/meta/[id]` never deletes anything, so link-preview bots are harmless.
  - `POST /api/open/[id]` does an atomic get-and-delete. It must stay POST: crawlers only issue GETs.
- **`src/lib/store.ts`** is the storage seam: `Store` interface with `UpstashStore` (Redis, uses `GETDEL`) and `MemoryStore` (dev/tests). `getStore()` picks Upstash if `UPSTASH_REDIS_REST_*` (or `KV_REST_API_*`) is set; in production without Redis it throws unless `ALLOW_MEMORY_STORE`. Rate limiting (`rateLimited` in `api.ts`) uses the same store, keyed by `x-forwarded-for`.
- **Client flow:** `Composer` (sender: text or `DrawCanvas`, optional phrase, required consent) encrypts then posts. `Receiver` (page `/m/[id]`) reads the key from `location.hash`, calls meta, and only on the explicit tap calls open. It keeps the fetched ciphertext in a ref so a wrong passphrase can be retried without a second fetch. `Cloth` is the shared "bandhani knot" reveal animation, used on the home page demo and the receiver.
- **Privacy plumbing you must not undo:**
  - `next.config.ts` sets `Referrer-Policy: no-referrer` and a strict CSP (production only; `connect-src 'self'`), so any third-party script or beacon needs a deliberate CSP change and a Privacy page update.
  - `src/lib/analytics.ts` `sanitizeUrl` strips the `#key`, the query and the secret id before Vercel Analytics / Speed Insights see a URL (`AnalyticsScrubbed.tsx`). Any new tracker (e.g. a Meta Pixel) must not load on `/m/*`.
  - `/m/[id]` is `noindex`.
- **Link fragment:** `#<key>.<lang>.<theme>`, parsed by `parseLinkFragment`. Only the key is secret; language and theme choose the page's look. Scheduled reveal is enforced server-side (`opensAt` in meta, `425` from `/api/open`); the receiver countdown uses the server's `now`. `/mine` is localStorage-only (`src/lib/sent.ts`).
- **SEO/GEO content:** home FAQ text is `src/lib/locales/home/<code>.ts` (EN/HI/GU only; other languages deliberately show nothing), rendered visibly and as JSON-LD via `homeJsonLd`. Occasion pages are `src/lib/occasions.ts` + `(app)/for/[occasion]`. `/llms.txt` is a route handler. Anything stated there or in the FAQ must stay true to the product (e.g. the 18-language count is derived from `HOME_LANGS`).
- **Reports:** `POST /api/report` (`ReportPanel` in the receiver) is the only path where secret content reaches the server, and only because the receiver chose to send it. `Store.addReport` keeps it 60 days with no identifying data; never add the id, IP or link to a report.
- **i18n:** 23 languages. `src/lib/languages.ts` is the registry (codes, native names, `rtl`, `draft`). UI text is `src/lib/locales/<code>.ts` and Privacy/Terms text is `src/lib/locales/legal/<code>.ts`, both typed against `en` and lazy-loaded through `locales/loaders.ts`. A new UI string must be added to every language file; `locales.test.ts` fails otherwise (and checks the legal pages keep the same structure, `{email}` token and code spans). Draft languages are hidden from the picker. The sender's language rides in the link fragment (`#key.lang`, parsed by `parseLinkFragment`). Use logical Tailwind classes (`ps-`, `text-start`, `start-`) so RTL works. `next/font` options must be literals (no spread).
- **Styling:** Tailwind 4 via `@tailwindcss/turbopack` (configured in `next.config.ts`). Theme tokens (raat, haldi, bandhani, abhla…) are in `globals.css`; shared class strings are in `src/components/ui.ts`.

## Conventions

- No marketing/security claims like "100% secure"; SPEC §5 lists the approved wording.
- Public repo: never commit `.env*` with real values.
