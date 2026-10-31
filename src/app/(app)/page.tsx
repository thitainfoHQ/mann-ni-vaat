import Home from "@/components/Home";
import JsonLd from "@/components/JsonLd";
import { homeJsonLd } from "@/lib/jsonld";
import { loadHomeContent } from "@/lib/locales/homeContent";
import { defaultMetadata } from "@/lib/seo";
import { homeAlternates } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/", languages: homeAlternates() } };

export default async function Page() {
  const content = await loadHomeContent("en");
  const description = defaultMetadata.description ?? "";
  return (
    <>
      <JsonLd data={homeJsonLd({ lang: "en", path: "/", description, faq: content?.faq })} />
      <Home content={content} />
    </>
  );
}
