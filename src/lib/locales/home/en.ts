import type { HomeContent } from "./types";

const en: HomeContent = {
  howTitle: "How it works",
  steps: [
    { title: "Write or draw", body: "Type a message or draw a picture. Nothing leaves your device yet." },
    {
      title: "Locked in your browser",
      body: "Your browser encrypts it with AES-256-GCM. The key lives in the part of the link after the #, which browsers never send to servers, so we can't read it.",
    },
    {
      title: "Opens once, then it's gone",
      body: "Whoever has the link can open it one time. It is deleted from our server the moment it opens, or after 7 days if nobody opens it.",
    },
  ],
  faqTitle: "Questions and answers",
  faq: [
    {
      q: "What is Mann Ni Vaat?",
      a: "Mann Ni Vaat is a free website for sending a secret text message or drawing that can be opened only once. It is encrypted in your browser, needs no account or app, and is deleted as soon as it is opened. It works in English and 18 Indian languages.",
    },
    {
      q: "Can Mann Ni Vaat read my message?",
      a: "No. Your message is encrypted in your browser before it is sent. The key stays in the part of the link after the #, which browsers do not send to servers, so we never have it.",
    },
    {
      q: "What happens after someone opens it?",
      a: "It is deleted from our server immediately. The receiver can see it until they leave or refresh the page, and then it is gone for good.",
    },
    {
      q: "Can the receiver take a screenshot?",
      a: "Yes. No website can stop screenshots or someone photographing the screen. Send secrets only to people you trust.",
    },
    {
      q: "How long does an unopened secret last?",
      a: "Seven days. After that it is deleted automatically, even if nobody opened it.",
    },
    {
      q: "Do I need an account or an app?",
      a: "No. It works in any modern browser on a phone or computer. There is nothing to install and no sign-up.",
    },
    {
      q: "Can I schedule a secret for a birthday at midnight?",
      a: "Yes. You can choose a time up to 4 days ahead. The secret stays locked until then, and the receiver sees a countdown.",
    },
    {
      q: "Can I add an extra lock?",
      a: "Yes. You can add a secret phrase that the receiver must type as well as having the link. Share the phrase some other way, not in the same chat.",
    },
  ],
};

export default en;
