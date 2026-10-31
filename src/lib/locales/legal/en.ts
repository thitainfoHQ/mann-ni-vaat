import type { Legal, LegalDoc } from "./types";

const en: Legal & { safety: LegalDoc } = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: 31/10/2026",
    blocks: [
      {
        p: "Mann Ni Vaat lets you send one secret message or drawing that opens once and is then deleted. This service is provided for learning, education and entertainment.",
      },
      { h: "How your secret is protected" },
      {
        ul: [
          "Your message or drawing is encrypted in your browser before it is sent to us, using AES-256-GCM. The key is placed in the part of the link after the `#`. Browsers do not send that part to servers, so we never receive the key and cannot read your secret.",
          "If you add a secret phrase, the receiver needs both the link and the phrase. We never receive the phrase.",
          "Anyone who has the link (and the phrase, if you set one) can open the secret, and only the first person to open it will see it.",
        ],
      },
      { h: "What we store, and for how long" },
      {
        ul: [
          "The encrypted secret. It is deleted the moment it is opened, or automatically after 7 days if unopened.",
          "The optional hint, if you add one, and a random salt used with the phrase. These are not encrypted, so never put the phrase or anything private in the hint. They are deleted together with the secret.",
          "A short-lived counter tied to your network address, used only to limit abuse. It expires within an hour.",
        ],
      },
      {
        p: "We have no accounts and do not ask for your name, phone number or email. We do not sell data. We do not use advertising trackers. Your chosen language is saved in your own browser only.",
      },
      { h: "Analytics" },
      {
        p: "We use Vercel Web Analytics to count visits to the site and Vercel Speed Insights to measure how fast pages load, which helps us see whether it is working. We remove the part of the address after the `#`, any query string, and the secret's id before anything is sent, so the analytics never receive a key or an id. Pages such as a secret link are recorded only as `/m/[id]`. Vercel describes what it collects, and how it avoids cookies, in its own documentation.",
      },
      { h: "What we cannot protect you from" },
      {
        ul: [
          "Screenshots, screen recordings, or someone photographing the screen with another device. Nothing in a web browser can prevent this. Send secrets only to people you trust.",
          "Sharing the link with the wrong person, or a link that someone else sees before the receiver does.",
          "A weak secret phrase that someone can guess.",
          "Malware or other people with access to your device.",
        ],
      },
      {
        p: "We describe our protections as accurately as we can, but no system is perfectly secure, and we do not promise that it is.",
      },
      { h: "Service providers" },
      {
        p: "The site runs on Vercel (including Vercel Web Analytics and Speed Insights) and keeps encrypted data in Upstash Redis. These providers process technical data such as IP addresses to deliver the service, under their own policies.",
      },
      {
        p: "If you use the Report button, the secret you report (its text or drawing) and the reason you pick are sent to us, because you chose to share it. We keep reports for up to 60 days, use them only to look into abuse, and do not record who sent the report.",
      },
      {
        p: "If you schedule a reveal, the opening time is stored with the secret, unencrypted, so we can keep it locked until then. This browser also keeps a list of the secrets you create, including the links of ones not yet opened, so you can find them again. That list stays on your device only, and you can delete it at any time on the My secrets page.",
      },
      { h: "Contact" },
      {
        p: "Questions or reports of misuse: {email}. Because we cannot read secrets, we cannot recover or review a secret for you.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "Last updated: 11/10/2026",
    blocks: [
      { p: "By creating or opening a secret on Mann Ni Vaat you agree to these terms." },
      { h: "Purpose" },
      { p: "This service is for learning, education and entertainment only. It is not meant for anything critical or sensitive." },
      { h: "Use at your own risk" },
      {
        p: "The service is provided as it is, with no warranty. You use it at your own risk. You are responsible for what you send and for who you send it to. To the extent the law allows, we are not liable for any loss or harm that comes from using the service, including a secret being seen by someone else, lost, or not delivered.",
      },
      { h: "What you must not send" },
      {
        ul: [
          "Abusive, hateful, threatening or harassing content.",
          "Anything illegal, or content that sexualises or harms children.",
          "Content that infringes another person's rights, or impersonates another person.",
          "Spam, scams or attempts to trick people.",
          "Anything meant to attack, overload or probe the service.",
        ],
      },
      { h: "Encryption and what we can do" },
      {
        p: "Secrets are encrypted in your browser and we cannot read them. This also means we cannot check, recover or remove the content of a particular secret. We may limit or block access to the service to stop abuse.",
      },
      { h: "Security limits" },
      {
        p: "Anyone with the link, and the phrase if you set one, can open your secret, and only once. Screenshots and photos of the screen cannot be prevented. A secret is deleted when opened or after 7 days, but a person who has seen it can keep a copy.",
      },
      { h: "Changes" },
      { p: "We may change the service or these terms. Using the service after a change means you accept it." },
      { h: "Contact" },
      { p: "Questions or reports: {email}" },
    ],
  },
  safety: {
    title: "Safety",
    updated: "Last updated: 31/10/2026",
    blocks: [
      {
        p: "Mann Ni Vaat is for private messages between people who know each other. Here is how to stay safe, and what we do about abuse.",
      },
      { h: "Stay safe" },
      {
        ul: [
          "Anyone can send a secret, and we can't tell who sent it. A message that looks like it comes from your bank, a company or the police may be a scam.",
          "Never share OTPs, passwords or card numbers, and never send money, because of a message here.",
          "Be careful with any phone number, UPI ID or link inside a secret. Check with the person another way before you act.",
          "Anything you receive can be copied with a screenshot. Don't send anything you would regret being seen.",
        ],
      },
      { h: "What is not allowed" },
      {
        p: "Scams, threats, harassment, blackmail, content that harms children, and anything illegal. See the Terms of Use for the full list.",
      },
      { h: "How to report" },
      {
        ul: [
          "After you open a secret, tap Report this secret and choose a reason. Only then is the secret sent to us. We cannot read a secret otherwise.",
          "You can also write to {email}. We cannot look up a secret from its link, so use the Report button to send us the actual content.",
        ],
      },
      { h: "What we do" },
      {
        ul: [
          "We review reports, and we may limit or block network addresses that misuse the service.",
          "We keep reports for up to 60 days and do not record who sent them.",
          "Where the law requires it, we respond to valid requests from the authorities. We can only share the limited technical data we hold, and never the content of a secret that was not reported to us.",
        ],
      },
      { h: "If you are in danger" },
      {
        p: "If someone is threatening you, or you think a crime is taking place, contact your local police or call 112 in India. You can report cybercrime at cybercrime.gov.in, and financial fraud on 1930.",
      },
    ],
  },
};

export default en;
