"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/config";
import { LANGS, useT } from "@/lib/i18n";

export default function Shell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useT();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-8">
      <header className="flex items-center justify-between py-4">
        <Link href="/" className="font-display text-xl font-bold leading-none text-abhla">
          {t.brandScript}
        </Link>
        <div role="group" aria-label={t.langLabel} className="flex overflow-hidden rounded-lg border border-raat-line">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              lang={l.code}
              aria-label={l.name}
              aria-pressed={lang === l.code}
              onClick={() => setLang(l.code)}
              className={`min-h-10 min-w-11 px-3 text-sm font-semibold transition-colors ${
                lang === l.code ? "bg-haldi text-raat-deep" : "text-abhla-dim hover:text-abhla"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
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
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-4 hover:text-abhla hover:underline">
            {t.footContact}
          </a>
        </nav>
        <p className="mt-3">{t.footNote}</p>
      </footer>
    </div>
  );
}
