import type { Lang } from "../languages";
import en, { type Dict } from "./en";
import enLegal from "./legal/en";
import type { Legal } from "./legal/types";

// One chunk per language, fetched only when that language is chosen.
const dicts: Record<Lang, () => Promise<{ default: Dict }>> = {
  en: () => Promise.resolve({ default: en }),
  as: () => import("./as"),
  bn: () => import("./bn"),
  brx: () => import("./brx"),
  doi: () => import("./doi"),
  gu: () => import("./gu"),
  hi: () => import("./hi"),
  kn: () => import("./kn"),
  ks: () => import("./ks"),
  kok: () => import("./kok"),
  mai: () => import("./mai"),
  ml: () => import("./ml"),
  mni: () => import("./mni"),
  mr: () => import("./mr"),
  ne: () => import("./ne"),
  or: () => import("./or"),
  pa: () => import("./pa"),
  sa: () => import("./sa"),
  sat: () => import("./sat"),
  sd: () => import("./sd"),
  ta: () => import("./ta"),
  te: () => import("./te"),
  ur: () => import("./ur"),
};

const legals: Record<Lang, () => Promise<{ default: Legal }>> = {
  en: () => Promise.resolve({ default: enLegal }),
  as: () => import("./legal/as"),
  bn: () => import("./legal/bn"),
  brx: () => import("./legal/brx"),
  doi: () => import("./legal/doi"),
  gu: () => import("./legal/gu"),
  hi: () => import("./legal/hi"),
  kn: () => import("./legal/kn"),
  ks: () => import("./legal/ks"),
  kok: () => import("./legal/kok"),
  mai: () => import("./legal/mai"),
  ml: () => import("./legal/ml"),
  mni: () => import("./legal/mni"),
  mr: () => import("./legal/mr"),
  ne: () => import("./legal/ne"),
  or: () => import("./legal/or"),
  pa: () => import("./legal/pa"),
  sa: () => import("./legal/sa"),
  sat: () => import("./legal/sat"),
  sd: () => import("./legal/sd"),
  ta: () => import("./legal/ta"),
  te: () => import("./legal/te"),
  ur: () => import("./legal/ur"),
};

export const loadDict = (l: Lang) => dicts[l]().then((m) => m.default);
export const loadLegal = (l: Lang) => legals[l]().then((m) => m.default);
