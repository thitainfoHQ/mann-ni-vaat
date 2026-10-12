# Mann Ni Vaat (મનની વાત)

Send a secret message or drawing that opens once and then disappears. Built for Navratri 2026, for learning, education and entertainment.

- Encrypted in the sender's browser (AES-256-GCM). The key lives in the link after the `#`, so the server never sees it.
- Opens exactly once. The server deletes the ciphertext in the same step that hands it out.
- Unopened secrets expire after 7 days.
- Optional secret phrase (PBKDF2 + HKDF) that the receiver needs on top of the link.
- English, Hindi and Gujarati.

See [SPEC.md](./SPEC.md) for the full design.

## Run it

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

## What it cannot do

It cannot stop screenshots or someone photographing the screen. Anyone with the link (and the phrase, if set) can open it, once. The Privacy Policy and Terms say this plainly.

## Notes

- Hindi and Gujarati text should be reviewed by a native speaker.
- This repo is public, so never commit `.env*` files with real values.
