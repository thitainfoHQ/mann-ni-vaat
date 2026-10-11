import { CONTACT_EMAIL } from "@/lib/config";

export const metadata = { title: "Terms of Use · Mann Ni Vaat" };

export default function Terms() {
  return (
    <article className="max-w-[62ch] space-y-4 pt-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_a]:text-haldi [&_a]:underline [&_a]:underline-offset-4">
      <h1 className="text-4xl font-bold">Terms of Use</h1>
      <p className="text-abhla-dim">Last updated: 11 October 2026</p>
      <p>By creating or opening a secret on Mann Ni Vaat you agree to these terms.</p>

      <h2>Purpose</h2>
      <p>This service is for learning, education and entertainment only. It is not meant for anything critical or sensitive.</p>

      <h2>Use at your own risk</h2>
      <p>
        The service is provided as it is, with no warranty. You use it at your own risk. You are responsible for what
        you send and for who you send it to. To the extent the law allows, we are not liable for any loss or harm that
        comes from using the service, including a secret being seen by someone else, lost, or not delivered.
      </p>

      <h2>What you must not send</h2>
      <ul className="space-y-2">
        <li>Abusive, hateful, threatening or harassing content.</li>
        <li>Anything illegal, or content that sexualises or harms children.</li>
        <li>Content that infringes another person&apos;s rights, or impersonates another person.</li>
        <li>Spam, scams or attempts to trick people.</li>
        <li>Anything meant to attack, overload or probe the service.</li>
      </ul>

      <h2>Encryption and what we can do</h2>
      <p>
        Secrets are encrypted in your browser and we cannot read them. This also means we cannot check, recover or
        remove the content of a particular secret. We may limit or block access to the service to stop abuse.
      </p>

      <h2>Security limits</h2>
      <p>
        Anyone with the link, and the phrase if you set one, can open your secret, and only once. Screenshots and
        photos of the screen cannot be prevented. A secret is deleted when opened or after 7 days, but a person who
        has seen it can keep a copy.
      </p>

      <h2>Changes</h2>
      <p>We may change the service or these terms. Using the service after a change means you accept it.</p>

      <h2>Contact</h2>
      <p>
        Questions or reports: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </article>
  );
}
