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
- **i18n:** `src/lib/i18n.tsx` holds `en`, `hi`, `gu` dictionaries; `hi` and `gu` are typed `typeof en`, so every new string must be added to all three. Hindi/Gujarati copy needs native-speaker review. Fonts per script are set in `layout.tsx` and `globals.css`.
- **Styling:** Tailwind 4 via `@tailwindcss/turbopack` (configured in `next.config.ts`). Theme tokens (raat, haldi, bandhani, abhla…) are in `globals.css`; shared class strings are in `src/components/ui.ts`.

## Conventions

- No marketing/security claims like "100% secure"; SPEC §5 lists the approved wording.
- Public repo: never commit `.env*` with real values.
