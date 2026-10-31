import { HOME_LANGS } from "./seo";
import type { Theme } from "./themes";

// Landing pages for things people actually search for ("birthday message that disappears"). They are English-only
// for now. Each one links into the composer with the matching look already chosen.
export type Occasion = {
  slug: string;
  theme: Theme;
  label: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  ideas: string[];
  tip: string;
  cta: string;
};

const langs = HOME_LANGS.length;

export const OCCASIONS: Occasion[] = [
  {
    slug: "birthday",
    theme: "birthday",
    label: "Birthday",
    metaTitle: "Send a Secret Birthday Message That Opens Once",
    metaDescription:
      "Write a birthday wish that stays locked until midnight and opens only once. Free, encrypted in your browser, no account needed.",
    h1: "A birthday wish that opens at midnight",
    intro:
      "Make the first message of their birthday feel special. Write it or draw it, choose a time up to 4 days ahead, and send the link. It stays locked until then and the person sees a countdown. When they open it, it opens once and is deleted.",
    ideas: [
      "Start with the memory you would most like them to smile about.",
      "Say one thing you admire about them that you never say out loud.",
      "Keep it short enough to read in one go, because it only opens once.",
    ],
    tip: "Turn on Schedule the reveal and pick 12:00 am on their birthday.",
    cta: "Write a birthday wish",
  },
  {
    slug: "anniversary",
    theme: "anniversary",
    label: "Anniversary",
    metaTitle: "Send a Secret Anniversary Message That Opens Once",
    metaDescription:
      "Say what you feel on your anniversary in a private message that opens once and disappears. Free, encrypted in your browser.",
    h1: "An anniversary note meant only for them",
    intro:
      "Some things are better said privately. Write or draw your anniversary message, add a secret phrase only the two of you would know if you like, and send the link. It opens one time and is then deleted.",
    ideas: [
      "Name the small moment you would choose to live again.",
      "Tell them what you are looking forward to next year.",
      "Add a secret phrase that only the two of you know, and share it in person.",
    ],
    tip: "Schedule it for midnight, or for the time you first met.",
    cta: "Write an anniversary note",
  },
  {
    slug: "diwali",
    theme: "diwali",
    label: "Diwali",
    metaTitle: "Send a Secret Diwali Wish That Opens Once",
    metaDescription:
      "Send a private Diwali greeting that opens only once. Free, in English and Indian languages, encrypted in your browser.",
    h1: "A Diwali wish, tied up and just for them",
    intro: `Share a personal Diwali greeting with someone who matters. The cloth takes the colour of a diya, they untie the knot once, and the message is gone. Write in your own language: the site works in English and ${langs} Indian languages.`,
    ideas: [
      "Wish them light in the part of life that feels dark right now.",
      "Mention one thing from this year you are grateful for together.",
      "Write in the language you speak at home.",
    ],
    tip: "Choose the Diwali look so the cloth matches the festival.",
    cta: "Write a Diwali wish",
  },
  {
    slug: "sorry",
    theme: "sorry",
    label: "Sorry",
    metaTitle: "Say Sorry in a Private Message That Opens Once",
    metaDescription:
      "Apologise privately with a message that opens once and is then deleted. Free, no account, encrypted in your browser.",
    h1: "Say sorry, just once, just to them",
    intro:
      "A good apology is honest and private. Write what you want to say, choose the quiet Sorry look, and send the link. They open it when they are ready, and it is not left sitting in a chat.",
    ideas: [
      "Say exactly what you are sorry for, without a “but”.",
      "Say what you will do differently.",
      "Do not ask for forgiveness in the message. Give them space.",
    ],
    tip: "Add a secret phrase if you want only them to be able to read it.",
    cta: "Write an apology",
  },
  {
    slug: "miss-you",
    theme: "missyou",
    label: "I miss you",
    metaTitle: "Tell Someone You Miss Them With a Secret Message",
    metaDescription:
      "Send an I-miss-you message that opens once and disappears. Free, encrypted in your browser, no account needed.",
    h1: "Tell them you miss them",
    intro:
      "Missing someone is easy to feel and hard to say. Write it or draw it, and send a link that opens once, so what you say stays between the two of you.",
    ideas: [
      "Name the small thing that reminded you of them today.",
      "Say when you would most like to see them.",
      "Draw instead of writing if words feel too big.",
    ],
    tip: "Pick the I miss you look, an indigo cloth for a quiet message.",
    cta: "Write an I miss you",
  },
];

export const findOccasion = (slug: string) => OCCASIONS.find((o) => o.slug === slug);
