import type { MetadataRoute } from "next";
import { homeAlternates, HOME_LANGS } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const abs = (path: string) => new URL(path, siteUrl).toString();
  const languages = Object.fromEntries(Object.entries(homeAlternates()).map(([k, v]) => [k, abs(v)]));
  return [
    { url: abs("/"), changeFrequency: "weekly", priority: 1, alternates: { languages } },
    ...HOME_LANGS.map((l) => ({ url: abs(`/${l}`), changeFrequency: "weekly" as const, priority: 0.8, alternates: { languages } })),
    { url: abs("/new"), changeFrequency: "monthly", priority: 0.7 },
    { url: abs("/safety"), changeFrequency: "monthly", priority: 0.4 },
    { url: abs("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: abs("/terms"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
