import { notFound, permanentRedirect } from "next/navigation";
import Shell from "@/components/Shell";
import RootDocument from "@/components/RootDocument";
import { LangProvider } from "@/lib/i18n";
import { isLang } from "@/lib/languages";
import { loadDict } from "@/lib/locales/loaders";
import { defaultMetadata, HOME_LANGS, viewport as sharedViewport } from "@/lib/seo";

// Home pages in each language, written into the HTML so search engines can read them: /hi, /gu, /mr, ...
// English stays at "/". Drafts (unreviewed languages) get no page.
export const metadata = defaultMetadata;
export const viewport = sharedViewport;

export function generateStaticParams() {
  return HOME_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (lang === "en") permanentRedirect("/");
  if (!isLang(lang) || !(HOME_LANGS as readonly string[]).includes(lang)) notFound();
  const dict = await loadDict(lang);

  return (
    <RootDocument lang={lang}>
      <LangProvider key={lang} initial={{ lang, dict }}>
        <Shell>{children}</Shell>
      </LangProvider>
    </RootDocument>
  );
}
