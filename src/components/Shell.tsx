"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/config";
import { PICKER_LANGS, useT, type Lang } from "@/lib/i18n";
import { HOME_LANGS, homePath } from "@/lib/seo";

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
  const { setLang, t } = useT();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-8">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="font-display text-xl font-bold leading-none text-abhla">
          {t.brandScript}
        </Link>
        {/* usePathname() needs a Suspense boundary on dynamic routes; the fallback looks the same. */}
        <Suspense fallback={<LangSelect onPick={setLang} />}>
          <LangPicker />
        </Suspense>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-12 border-t border-raat-line pt-5 text-sm text-abhla-dim">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/privacy" className="underline-offset-4 hover:text-abhla hover:underline">
            {t.privacy}
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:text-abhla hover:underline">
            {t.terms}
          </Link>
          <Link href="/mine" className="underline-offset-4 hover:text-abhla hover:underline">
            {t.footMine}
          </Link>
          <Link href="/safety" className="underline-offset-4 hover:text-abhla hover:underline">
            {t.safetyLink}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-4 hover:text-abhla hover:underline">
            {t.footContact}
          </a>
        </nav>
        <p className="mt-3">{t.footNote}</p>
      </footer>
    </div>
  );
}
