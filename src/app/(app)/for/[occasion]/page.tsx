import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { btnPrimary } from "@/components/ui";
import { findOccasion, OCCASIONS } from "@/lib/occasions";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ occasion: o.slug }));
}

export async function generateMetadata({ params }: PageProps<"/for/[occasion]">): Promise<Metadata> {
  const { occasion } = await params;
  const o = findOccasion(occasion);
  if (!o) return {};
  return {
    title: `${o.metaTitle} · Mann Ni Vaat`,
    description: o.metaDescription,
    alternates: { canonical: `/for/${o.slug}` },
    openGraph: { title: o.metaTitle, description: o.metaDescription, siteName: "Mann Ni Vaat", type: "article" },
  };
}

export default async function OccasionPage({ params }: PageProps<"/for/[occasion]">) {
  const { occasion } = await params;
  const o = findOccasion(occasion);
  if (!o) notFound();

  const base = siteUrl.replace(/\/$/, "");
  const url = `${base}/for/${o.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: o.metaTitle, description: o.metaDescription, inLanguage: "en" },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Mann Ni Vaat", item: base },
          { "@type": "ListItem", position: 2, name: o.label, item: url },
        ],
      },
    ],
  };

  return (
    <article className="pt-4">
      <JsonLd data={jsonLd} />
      <p className="text-sm font-semibold text-haldi">{o.label}</p>
      <h1 className="mt-1 text-4xl font-bold">{o.h1}</h1>
      <p className="mt-4 max-w-[52ch]">{o.intro}</p>

      <Link href={`/new?theme=${o.theme}`} className={`${btnPrimary} mt-6 w-full sm:w-auto`}>
        {o.cta}
      </Link>

      <h2 className="mt-10 text-2xl font-bold">Ideas for what to write</h2>
      <ul className="mt-3 max-w-[52ch] space-y-2">
        {o.ideas.map((idea) => (
          <li key={idea} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.7em] size-2 shrink-0 rounded-full bg-haldi" />
            <span>{idea}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-[52ch] text-abhla-dim">{o.tip}</p>

      <h2 className="mt-10 text-2xl font-bold">How it works</h2>
      <p className="mt-2 max-w-[52ch] text-abhla-dim">
        Your message is encrypted in your browser, and the key stays in the part of the link after the # that browsers never send
        to servers. Whoever has the link can open it once. It is deleted when opened, or after 7 days if nobody opens it. No account or
        app is needed.{" "}
        <Link href="/" className="text-haldi underline underline-offset-4">
          Read more
        </Link>
        .
      </p>

      <h2 className="mt-10 text-2xl font-bold">Other occasions</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {OCCASIONS.filter((x) => x.slug !== o.slug).map((x) => (
          <li key={x.slug}>
            <Link
              href={`/for/${x.slug}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-raat-line px-4 text-sm font-semibold hover:border-abhla-dim"
            >
              {x.label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
