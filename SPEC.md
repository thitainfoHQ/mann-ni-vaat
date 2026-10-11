# Mann Ni Vaat (મનની વાત): Product Spec (v0.3)

Name meaning: "What is in my heart/mind", a warm Gujarati phrase for something you want to tell one person. Use the Gujarati script (મનની વાત) in the logo and headings, with "Mann Ni Vaat" as the roman wordmark. Not affiliated with any radio programme or government body; keep the tone personal and romantic.
Tagline: *Mann ni vaat, bas ek vaar.* (What is in my heart, just once.)

A website where someone sends a secret message **or** a drawing to another person. It is encrypted in the sender's browser, can be opened exactly once, and is then deleted. Built for Navratri 2026 (Oct 11 to 19), useful all year, aimed at couples and friends.

Purpose statement (shown on site): learning, education and entertainment only.

---

## 1. Decisions locked so far

| Topic | Decision |
|---|---|
| Name | Mann Ni Vaat (મનની વાત), final. Domain candidates: mannivaat.in, mannnivaat.com |
| Content | Sender sends **one** of: typed text they write themselves, or a drawing. No ready-made messages |
| Access | Anyone with the link (link only) |
| Optional extra lock | Secret passphrase (+ optional hint), shared separately by the sender |
| Lifetime | Unopened: auto-deleted after 7 days. Opened: deleted immediately |
| Sender notification | None |
| Languages | English, Hindi, Gujarati |
| Accounts / login | None |
| Hosting | Vercel (free Hobby plan to start) + Upstash Redis |

## 2. User flows

### Sender
1. Home: pick language, tap "Send a secret".
2. Choose the type: **Write a message** or **Draw** (one only).
3. Optional: set a **secret phrase** + optional **hint**.
4. Tick the consent box (see section 6), then tap "Create secret link".
5. The browser encrypts the content, uploads the ciphertext, and shows the link `https://<domain>/m/<id>#<key>`.
6. Share buttons: WhatsApp, copy link. Warning text: "This link works once. Whoever opens it first sees it."

### Receiver
1. Opens the link. The page loads with a themed "A secret is waiting for you" screen. **No message data is fetched yet.**
2. If a phrase was set, the page shows the hint and a phrase box.
3. Taps the diya to reveal. The browser fetches the ciphertext (server deletes it in that same step), decrypts locally, and shows the message or drawing with an animation.
4. Leaving or refreshing the page loses it for good. Reopening the link shows "This secret is gone."

## 3. Cryptography

- Web Crypto API only, no custom algorithms.
- **Link key:** 256-bit random AES-GCM key, base64url-encoded in the URL fragment (`#`). Browsers do not send the fragment to servers.
- **Passphrase (optional):** PBKDF2-SHA-256 (high iteration count, e.g. 600k) with a random 16-byte salt gives a passphrase key. The final key is HKDF(link key || passphrase key). Without a phrase, the final key is the link key.
- **Cipher:** AES-256-GCM, random 12-byte IV per message. GCM authentication detects tampering and wrong phrases.
- **Payload (before encryption):** JSON `{ v, kind: "text" | "drawing", lang, text? , image? }`. Drawings are exported as WebP (max about 500 KB total payload).
- Padding: pad plaintext to size buckets so the message length leaks less.
- Message ID: 128-bit random, URL-safe. Unguessable.

## 4. Server (Vercel API routes + Upstash Redis)

Stored per message, both with a 7-day TTL:
- `msg:<id>` = ciphertext + IV
- `meta:<id>` = `{ hasPassphrase, salt, hint }` (the hint is unencrypted; the UI warns the sender not to write the phrase in it)

Endpoints:
- `POST /api/create`: validates size and shape, stores with `EX 604800`, returns `{ id }`. Rate-limited per IP.
- `GET /api/meta/:id`: returns `{ exists, hasPassphrase, salt, hint }`. This does **not** burn anything, so link-preview bots are harmless.
- `POST /api/open/:id`: atomic `GETDEL` of `msg:<id>`, then deletes `meta:<id>`. Returns the ciphertext once. A POST on explicit tap prevents prefetch crawlers from burning it.

Passphrase retry rule: the ciphertext is handed out once, and the browser **keeps it in memory** so a mistyped phrase can be retried without another fetch. Closing or refreshing the tab before a successful decrypt loses the message. This is stated on the page.

Server logs must not record the full URL fragment (it never reaches the server) and should not record message contents. Keep logs minimal.

## 5. Honest security claims (website wording)

Do **not** claim "100% secure". Use:
- "Your secret is encrypted in your browser before it leaves your device. We never have the key and cannot read it."
- "We keep nothing after it is opened. Unopened secrets are deleted after 7 days."
- "We cannot stop screenshots or someone photographing the screen with another device. Share only with people you trust."
- "Anyone with the link (and the phrase, if you set one) can open it, and only once."

## 6. Legal / policy pages (draft text to be written; not legal advice)

Pages: **Privacy Policy**, **Terms of Use**, plus a short disclaimer on the send screen with a required checkbox.

Must cover:
- End-to-end encrypted: the operator cannot read messages.
- Use at your own risk.
- No abusive, hateful, harassing, illegal or explicit content. For learning, education and entertainment only.
- Screenshots and photos from another device can leak a message. The service cannot prevent that.
- What is stored: ciphertext (until opened or 7 days), the optional hint, and a small amount of technical data (rate limiting). No accounts, no message content, no keys.
- Deletion: on open, or at 7 days.
- Contact / abuse report address: info@thitainfo.com.
- Recommend a quick legal review if it grows beyond a hobby project.

## 7. Look and feel

- Navratri theme: deep maroon/indigo with gold, diya glow, rangoli and dandiya motifs, subtle garba animation on reveal. Optional 9-day colour accent that changes each day.
- Mobile first (most traffic will arrive from WhatsApp). Fast on cheap phones, light JS.
- Drawing canvas: pen, colour palette, eraser, undo, clear, stamps (diya, heart, dandiya).
- Open Graph preview card for the link that shows a generic "A secret is waiting" image and **no** message info.
- Language switcher (EN / हिन्दी / ગુજરાતી) on every page. The interface is translated; message content is whatever the sender writes.

## 8. Virality hooks (in scope for v1)

- After reveal: "Send one back" button, which starts a new secret flow.
- One-tap WhatsApp share with a pre-written line in the chosen language.
- Shareable "I sent a secret" card (no content).

## 9. Out of scope for v1

Accounts, notifications to the sender, read receipts, replies inside a thread, voice or video, image upload from the gallery, native apps.

## 10. Tech stack

Next.js (App Router) + TypeScript, Tailwind, Vercel, Upstash Redis (`@upstash/redis`), Web Crypto API. Simple i18n via JSON dictionaries. Tests for the crypto round trip and the API's burn-on-open behavior.

## 11. Cost

- Start: free (Vercel Hobby + Upstash free tier + free `*.vercel.app` URL). Check current limits before launch.
- Optional domain: about ₹100 to 800 per year.
- If it goes viral: expect a few dollars per month for Redis and bandwidth.

## 12. Open items before building

1. Domain choice (`dilkaraaz.in` or `.com`; both appeared unregistered in a DNS check, confirm on a registrar).
2. Contact email for abuse reports and the policy pages.
3. (Resolved) No default messages; senders write their own. Abuse/contact email: info@thitainfo.com.
4. (Resolved) One type per message only: text or drawing.

## 13. Build plan

1. Project scaffold, theme, i18n.
2. Crypto module with tests.
3. Redis API (create, meta, open) with rate limiting.
4. Sender flow (text, drawing, passphrase).
5. Receiver flow (reveal animation, phrase entry, gone page).
6. Policy pages and consent checkbox.
7. Open Graph card, WhatsApp share, "send one back".
8. Deploy to Vercel and run a real-device test on WhatsApp.
