import type { Metadata } from "next";
import Home from "@/components/Home";
import { isLang } from "@/lib/languages";
import { loadDict } from "@/lib/locales/loaders";
import { homeAlternates } from "@/lib/seo";

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

export default function Page() {
  return <Home />;
}
