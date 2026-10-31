import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Home from "@/components/Home";
import JsonLd from "@/components/JsonLd";
import { homeJsonLd } from "@/lib/jsonld";
import { loadHomeContent } from "@/lib/locales/homeContent";
import { isLang } from "@/lib/languages";
import { loadDict } from "@/lib/locales/loaders";
import { HOME_LANGS, homeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang) || lang === "en") return {};
  const t = await loadDict(lang);
  const title = `${t.tagline} · Mann Ni Vaat`;
  return {
    title,
    description: t.intro,
    alternates: { canonical: `/${lang}`, languages: homeAlternates() },
    openGraph: { title, description: t.intro, siteName: "Mann Ni Vaat", type: "website", locale: lang },
    twitter: { card: "summary_large_image", title, description: t.intro },
  };
}

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang) || !(HOME_LANGS as readonly string[]).includes(lang)) notFound();
  const [t, content] = await Promise.all([loadDict(lang), loadHomeContent(lang)]);
  return (
    <>
      <JsonLd data={homeJsonLd({ lang, path: `/${lang}`, description: t.intro, faq: content?.faq })} />
      <Home content={content} />
    </>
  );
}
