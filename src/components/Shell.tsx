"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import Knot from "@/components/Knot";
import { CONTACT_EMAIL } from "@/lib/config";
import { OCCASIONS } from "@/lib/occasions";
import { PICKER_LANGS, useT, type Dict, type Lang } from "@/lib/i18n";
import { HOME_LANGS, homePath } from "@/lib/seo";

const BRAND = "Mann Ni Vaat";

/** The tab title for a page, in the reader's language. `null` means "leave the title the server set". */
export function titleFor(path: string, t: Dict, lang: Lang): string | null {
  if (path === "/new") return `${t.create} · ${BRAND}`;
  if (path === "/mine") return `${t.mineTitle} · ${BRAND}`;
  if (path === "/privacy") return `${t.privacy} · ${BRAND}`;
  if (path === "/terms") return `${t.terms} · ${BRAND}`;
  if (path === "/safety") return `${t.safetyLink} · ${BRAND}`;
  if (path.startsWith("/m/")) return `${t.waitingTitle} · ${BRAND}`;
  if (path === "/" && lang !== "en") return `${t.tagline} · ${BRAND}`;
  if (/^\/[a-z]{2,3}$/.test(path)) return `${t.tagline} · ${BRAND}`;
  return null;
}

/**
 * Keeps the browser tab title matching the page and the chosen language, including when the language is switched
 * without leaving the page. (The server already sends a title; this only follows later changes.)
 */
function PageTitle() {
  const { t, lang } = useT();
  const pathname = usePathname();
  useEffect(() => {
    const title = titleFor(pathname, t, lang);
    if (title) document.title = title;
  }, [pathname, t, lang]);
  return null;
}

/** The language dropdown itself. `onPick` decides what choosing a language does. */
function LangSelect({ onPick }: { onPick: (l: Lang) => void }) {
  const { selected, t } = useT();
  return (
      <div className="relative">
        <select
          aria-label={t.langLabel}
          value={selected}
          onChange={(e) => onPick(e.target.value as Lang)}
          className="min-h-11 max-w-[11rem] cursor-pointer appearance-none rounded-lg border border-raat-line bg-raat-deep ps-3 pe-9 text-sm font-semibold text-abhla transition-colors hover:border-abhla-dim"
        >
          {PICKER_LANGS.map((l) => (
            <option key={l.code} value={l.code} lang={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute end-3 top-1/2 size-3 -translate-y-1/2 text-abhla-dim"
        >
          <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
  );
}

/** On the home pages each language has its own address (/, /hi, /gu...), so the picker moves between them.
 *  Everywhere else (secret links especially) the address must not change, so it only switches the text. */
function LangPicker() {
  const { setLang } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const hasHome = (l: string) => l === "en" || (HOME_LANGS as readonly string[]).includes(l);

  function pick(l: Lang) {
    setLang(l);
    const onHome = pathname === "/" || (/^\/[a-z]{2,3}$/.test(pathname) && hasHome(pathname.slice(1)));
    if (onHome && hasHome(l)) router.push(homePath(l));
  }
  return <LangSelect onPick={pick} />;
}

export default function Shell({ children }: { children: ReactNode }) {
  const { setLang, t, lang } = useT();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-8 sm:px-6 lg:px-8">
      <header className="pt-4">
        <div className="flex items-center justify-between pb-3">
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold leading-none text-abhla">
            <Knot className="size-8" />
            {t.brandScript}
          </Link>
          {/* usePathname() needs a Suspense boundary on dynamic routes; the fallback looks the same. */}
          <Suspense fallback={<LangSelect onPick={setLang} />}>
            <LangPicker />
          </Suspense>
        </div>
        <div className="torana" aria-hidden="true" />
      </header>

      <Suspense fallback={null}>
        <PageTitle />
      </Suspense>
      <main className="flex-1">{children}</main>

      <footer className="mt-16 text-sm text-abhla-dim">
        <div className="torana mb-6" aria-hidden="true" />
        <nav aria-label="Mann Ni Vaat" className="flex flex-wrap gap-x-6 gap-y-2">
          {(
            [
              ["/new?type=text", t.writeCta],
              ["/new?type=drawing", t.drawCta],
              ["/mine", t.footMine],
              ["/safety", t.safetyLink],
              ["/privacy", t.privacy],
              ["/terms", t.terms],
            ] as const
          ).map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-8 items-center underline-offset-4 hover:text-abhla hover:underline">
              {label}
            </Link>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-8 items-center underline-offset-4 hover:text-abhla hover:underline">
            {t.footContact}
          </a>
        </nav>
        {lang === "en" && (
          <nav aria-label="Ideas" className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {OCCASIONS.map((o) => (
              <Link key={o.slug} href={`/for/${o.slug}`} className="inline-flex min-h-8 items-center underline-offset-4 hover:text-abhla hover:underline">
                {o.label}
              </Link>
            ))}
          </nav>
        )}
        <p className="mt-4">{t.footNote}</p>
      </footer>
    </div>
  );
}
