"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import Cloth from "@/components/Cloth";
import { btnPrimary, btnQuiet } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { LANGS } from "@/lib/languages";
import type { HomeContent } from "@/lib/locales/home/types";
import { HOME_LANGS, homePath } from "@/lib/seo";
import { loadSent } from "@/lib/sent";
import { THEME_KEY, THEME_SWATCH, THEMES } from "@/lib/themes";

export default function Home({ content }: { content?: HomeContent | null }) {
  const { t, lang } = useT();
  // The demo opens on a sample letter, then the cloth ties itself over it: the product's whole idea in two seconds.
  // Tapping the tied cloth opens it again and shows what the receiver would read.
  // Anyone who prefers reduced motion gets the tied cloth straight away.
  const [untied, setUntied] = useState(true);
  const [intro, setIntro] = useState(true);
  const [mine, setMine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(
      () => {
        setUntied(false);
        setIntro(false);
      },
      reduce ? 0 : 1800,
    );
    return () => clearTimeout(timer);
  }, []);

  // Someone who has made secrets here before gets a way back to them.
  useEffect(() => {
    const total = loadSent().length;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMine(total > 0 ? total : null);
  }, []);

  // The address to share: this language's home page where there is one.
  const shareUrl = () => location.origin + ((HOME_LANGS as readonly string[]).includes(lang) ? homePath(lang) : "");
  const shareOnWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(`${t.inviteText} ${shareUrl()}`)}`, "_blank", "noopener,noreferrer");
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the address is in the bar already */
    }
  }

  const features: { href: string; title: string; text: string; swatch: keyof typeof THEME_SWATCH; icon: ReactNode }[] = [
    { href: "/new?type=text", title: t.writeCta, text: t.hubWrite, swatch: "classic", icon: <PenIcon /> },
    { href: "/new?type=drawing", title: t.drawCta, text: t.hubDraw, swatch: "birthday", icon: <BrushIcon /> },
    { href: "/new", title: t.themeLabel, text: t.hubLooks, swatch: "diwali", icon: <PaletteIcon /> },
    { href: "/new", title: t.phraseToggle, text: t.phraseIntro, swatch: "missyou", icon: <LockIcon /> },
    { href: "/new", title: t.scheduleToggle, text: t.scheduleIntro, swatch: "anniversary", icon: <ClockIcon /> },
    { href: "/mine", title: t.mineTitle, text: t.mineIntro, swatch: "sorry", icon: <ListIcon /> },
    { href: "/safety", title: t.safetyLink, text: t.hubSafety, swatch: "sorry", icon: <ShieldIcon /> },
  ];

  const languages = [{ code: "en" as const, name: "English" }, ...LANGS.filter((l) => (HOME_LANGS as readonly string[]).includes(l.code))];

  return (
    <div className="pt-6 lg:pt-10">
      {/* One screen, one job: start a secret. On a wide screen the demo moves beside it. */}
      <section className="grid gap-x-14 gap-y-7 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 className="text-balance font-display text-[2.75rem] font-bold leading-[1.04] sm:text-6xl lg:text-7xl">{t.tagline}</h1>
          <p className="mt-4 max-w-[36ch] text-lg text-abhla-dim lg:text-xl">{t.intro}</p>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <Cloth compact untied={untied} onTap={() => setUntied(true)}>
            <div className="paper p-5 text-center">
              <p className="font-display text-2xl font-bold leading-snug">{intro ? t.demoLetter : t.demoOpened}</p>
              {!intro && (
                <button
                  type="button"
                  onClick={() => setUntied(false)}
                  className="mx-auto mt-3 min-h-11 px-4 font-semibold text-bandhani-dark underline underline-offset-4"
                >
                  {t.demoAgain}
                </button>
              )}
            </div>
          </Cloth>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/new?type=text" className={`${btnPrimary} sm:px-10`}>
              {t.writeCta}
            </Link>
            <Link href="/new?type=drawing" className={`${btnQuiet} sm:px-8`}>
              {t.drawCta}
            </Link>
          </div>

          {mine !== null && (
            <Link
              href="/mine"
              className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-raat-line px-4 font-semibold hover:border-abhla-dim sm:max-w-sm"
            >
              {t.mineTitle}
              <span className="grid min-w-7 place-items-center rounded-full bg-haldi px-2 text-sm font-bold text-raat-deep">{mine}</span>
            </Link>
          )}

          <section aria-labelledby="ideas-title" className="mt-8">
            <h2 id="ideas-title" className="font-display text-xl font-bold">
              {t.ideasTitle}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {THEMES.filter((th) => th !== "classic").map((th) => (
                <li key={th}>
                  <Link
                    href={`/new?theme=${th}`}
                    className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-raat-line bg-raat-deep/50 ps-2.5 pe-4 font-semibold transition-colors hover:border-abhla-dim"
                  >
                    <span aria-hidden="true" className="grid size-7 place-items-center rounded-full" style={{ background: THEME_SWATCH[th].bg }}>
                      <span className="size-2 rounded-full" style={{ background: THEME_SWATCH[th].dot }} />
                    </span>
                    {t[THEME_KEY[th]]}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <ul className="mt-12 divide-y divide-raat-line rounded-2xl border border-raat-line bg-raat-deep/50 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {(
          [
            [t.fact1, <LockIcon key="l" />],
            [t.fact2, <OnceIcon key="o" />],
            [t.fact3, <HourglassIcon key="h" />],
          ] as [string, ReactNode][]
        ).map(([text, icon]) => (
          <li key={text} className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-5">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-raat text-haldi">
              {icon}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* The hub: everything the app does, one tap from here. */}
      <section aria-labelledby="hub-title" className="mt-16">
        <h2 id="hub-title" className="text-3xl font-bold lg:text-4xl">
          {t.hubTitle}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title}>
              <Link
                href={f.href}
                className="group flex h-full items-start gap-4 rounded-2xl border border-raat-line bg-raat-deep/50 p-4 transition-colors hover:border-abhla-dim sm:flex-col sm:gap-3 sm:p-5"
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-2xl text-white"
                  style={{ background: THEME_SWATCH[f.swatch].bg }}
                >
                  {f.icon}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-xl font-bold">{f.title}</span>
                  <span className="text-sm text-abhla-dim">{f.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {content && (
        <>
          <section aria-labelledby="how-title" className="mt-16">
            <h2 id="how-title" className="text-3xl font-bold lg:text-4xl">
              {content.howTitle}
            </h2>
            <ol className="mt-6 lg:grid lg:grid-cols-3 lg:gap-8">
              {content.steps.map((step, i) => (
                <li key={step.title} className="relative ps-12 pb-7 last:pb-0 lg:pb-0">
                  <span className="absolute start-0 top-0 grid size-9 place-items-center rounded-full bg-haldi font-display text-lg font-bold text-raat-deep">
                    {i + 1}
                  </span>
                  {i < content.steps.length - 1 && (
                    <span aria-hidden="true" className="absolute start-[17px] top-10 bottom-1 w-px bg-raat-line lg:hidden" />
                  )}
                  <h3 className="font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-1 text-abhla-dim">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-title" className="mt-16">
            <h2 id="faq-title" className="text-3xl font-bold lg:text-4xl">
              {content.faqTitle}
            </h2>
            {/* Two columns on a wide screen, each reading top to bottom; one list on a phone. */}
            <div className="mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
              {[content.faq.slice(0, Math.ceil(content.faq.length / 2)), content.faq.slice(Math.ceil(content.faq.length / 2))].map((col, c) => (
                <div key={c} className={`border-raat-line ${c === 0 ? "border-t" : "lg:border-t"}`}>
                  {col.map((f) => (
                    <details key={f.q} className="group border-b border-raat-line">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                        {f.q}
                        <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0 text-abhla-dim transition-transform group-open:rotate-180">
                          <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </summary>
                      <p className="pb-4 text-abhla-dim">{f.a}</p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Every language has its own home page, so this is both a menu and a set of links for search engines. */}
      <section aria-labelledby="langs-title" className="mt-16">
        <h2 id="langs-title" className="text-3xl font-bold lg:text-4xl">
          {t.langsTitle}
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {languages.map((l) => (
            <li key={l.code}>
              <Link
                href={homePath(l.code)}
                lang={l.code}
                aria-current={l.code === lang ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-xl border px-4 font-semibold transition-colors ${
                  l.code === lang ? "border-haldi bg-haldi/10" : "border-raat-line hover:border-abhla-dim"
                }`}
              >
                {l.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="share-title"
        className="mt-16 flex flex-col gap-5 rounded-3xl bg-bandhani/20 p-6 ring-1 ring-bandhani/40 lg:flex-row lg:items-center lg:justify-between lg:p-8"
      >
        <div>
          <h2 id="share-title" className="text-2xl font-bold lg:text-3xl">
            {t.shareTitle}
          </h2>
          <p className="mt-1 max-w-[46ch] text-abhla-dim">{t.inviteText}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={shareOnWhatsApp} className={btnPrimary}>
            {t.whatsapp}
          </button>
          <button type="button" onClick={copyLink} className={btnQuiet} aria-live="polite">
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </section>
    </div>
  );
}

const icon = { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const LockIcon = () => (
  <svg {...icon}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const OnceIcon = () => (
  <svg {...icon}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <path d="M11 10l1.5-1v5" />
  </svg>
);
const HourglassIcon = () => (
  <svg {...icon}>
    <path d="M6 3h12M6 21h12M7 3v3.5L12 12l-5 5.5V21M17 3v3.5L12 12l5 5.5V21" />
  </svg>
);
const PenIcon = () => (
  <svg {...icon}>
    <path d="M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    <path d="M14 7l3 3" />
  </svg>
);
const BrushIcon = () => (
  <svg {...icon}>
    <path d="M18 3c-4 2-8 6-9 10l3 3c4-1 8-5 10-9l-4-4Z" />
    <path d="M9 13c-3 0-4 2-4 4 0 1.5-1 2.5-2 3 3 1 7 1 8-2 .6-1.5 0-3-2-5Z" />
  </svg>
);
const PaletteIcon = () => (
  <svg {...icon}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10.5" cy="7" r="1" />
    <circle cx="15" cy="7.5" r="1" />
  </svg>
);
const ClockIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const ListIcon = () => (
  <svg {...icon}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4" cy="6" r="1" />
    <circle cx="4" cy="12" r="1" />
    <circle cx="4" cy="18" r="1" />
  </svg>
);
const ShieldIcon = () => (
  <svg {...icon}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
