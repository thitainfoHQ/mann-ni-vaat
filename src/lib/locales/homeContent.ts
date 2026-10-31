import type { Lang } from "../languages";
import type { HomeContent } from "./home/types";

// Only languages with a finished translation. Others show no "how it works" or FAQ section.
const loaders: Partial<Record<Lang, () => Promise<{ default: HomeContent }>>> = {
  en: () => import("./home/en"),
  hi: () => import("./home/hi"),
  gu: () => import("./home/gu"),
};

export async function loadHomeContent(lang: Lang): Promise<HomeContent | null> {
  const load = loaders[lang];
  return load ? (await load()).default : null;
}
