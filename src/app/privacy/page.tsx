import { CONTACT_EMAIL } from "@/lib/config";

export const metadata = { title: "Privacy Policy · Mann Ni Vaat" };

export default function Privacy() {
  return (
    <article className="max-w-[62ch] space-y-4 pt-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_a]:text-haldi [&_a]:underline [&_a]:underline-offset-4">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="text-abhla-dim">Last updated: 11 October 2026</p>
      <p>
        Mann Ni Vaat lets you send one secret message or drawing that opens once and is then deleted. This service is
        provided for learning, education and entertainment.
      </p>

      <h2>How your secret is protected</h2>
      <ul className="space-y-2">
        <li>
          Your message or drawing is encrypted in your browser before it is sent to us, using AES-256-GCM. The key is
          placed in the part of the link after the <code>#</code>. Browsers do not send that part to servers, so we
          never receive the key and cannot read your secret.
        </li>
        <li>
          If you add a secret phrase, the receiver needs both the link and the phrase. We never receive the phrase.
        </li>
        <li>
          Anyone who has the link (and the phrase, if you set one) can open the secret, and only the first person to
          open it will see it.
        </li>
      </ul>

      <h2>What we store, and for how long</h2>
      <ul className="space-y-2">
        <li>The encrypted secret. It is deleted the moment it is opened, or automatically after 7 days if unopened.</li>
        <li>
          The optional hint, if you add one, and a random salt used with the phrase. These are not encrypted, so never
          put the phrase or anything private in the hint. They are deleted together with the secret.
        </li>
        <li>
          A short-lived counter tied to your network address, used only to limit abuse. It expires within an hour.
        </li>
      </ul>
      <p>
        We have no accounts and do not ask for your name, phone number or email. We do not sell data. We do not use
        advertising trackers. Your chosen language is saved in your own browser only.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics to count visits to the site, which helps us see whether it is working. We remove the
        part of the address after the <code>#</code>, any query string, and the secret&apos;s id before anything is
        sent, so the analytics never receive a key or an id. Pages such as a secret link are recorded only as{" "}
        <code>/m/[id]</code>. Vercel describes what it collects, and how it avoids cookies, in its own documentation.
      </p>

      <h2>What we cannot protect you from</h2>
      <ul className="space-y-2">
        <li>
          Screenshots, screen recordings, or someone photographing the screen with another device. Nothing in a web
          browser can prevent this. Send secrets only to people you trust.
        </li>
        <li>Sharing the link with the wrong person, or a link that someone else sees before the receiver does.</li>
        <li>A weak secret phrase that someone can guess.</li>
        <li>Malware or other people with access to your device.</li>
      </ul>
      <p>
        We describe our protections as accurately as we can, but no system is perfectly secure, and we do not promise
        that it is.
      </p>

      <h2>Service providers</h2>
      <p>
        The site runs on Vercel (including Vercel Web Analytics) and keeps encrypted data in Upstash Redis. These
        providers process technical data such as IP addresses to deliver the service, under their own policies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or reports of misuse: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Because we cannot read
        secrets, we cannot recover or review a secret for you.
      </p>
    </article>
  );
}
