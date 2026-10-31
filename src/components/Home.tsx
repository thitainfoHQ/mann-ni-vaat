"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import Cloth from "@/components/Cloth";
import { btnPrimary, btnQuiet } from "@/components/ui";
import { useT } from "@/lib/i18n";
import type { HomeContent } from "@/lib/locales/home/types";

export default function Home({ content }: { content?: HomeContent | null }) {
  const { t } = useT();
  const [untied, setUntied] = useState(false);

  return (
    <div className="pt-6">
      <h1 className="text-balance font-display text-[2.75rem] font-bold leading-[1.04] sm:text-6xl">{t.tagline}</h1>
      <p className="mt-4 max-w-[36ch] text-lg text-abhla-dim">{t.intro}</p>

      <div className="mt-7">
        <Cloth compact untied={untied} onTap={() => setUntied(true)}>
          <p className="text-center font-display text-2xl font-bold leading-snug text-abhla">{t.demoOpened}</p>
          <button
            type="button"
            onClick={() => setUntied(false)}
            className="mx-auto mt-5 min-h-11 px-4 font-semibold text-haldi underline underline-offset-4"
          >
            {t.demoAgain}
          </button>
        </Cloth>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/new?type=text" className={`${btnPrimary} sm:flex-1`}>
          {t.writeCta}
        </Link>
        <Link href="/new?type=drawing" className={`${btnQuiet} sm:flex-1`}>
          {t.drawCta}
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-raat-line rounded-2xl border border-raat-line bg-raat-deep/50">
        {(
          [
            [t.fact1, <LockIcon key="l" />],
            [t.fact2, <OnceIcon key="o" />],
            [t.fact3, <HourglassIcon key="h" />],
          ] as [string, ReactNode][]
        ).map(([text, icon]) => (
          <li key={text} className="flex items-center gap-3 px-4 py-3">
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-raat text-haldi">
              {icon}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {content && (
        <>
          <section aria-labelledby="how-title" className="mt-14">
            <h2 id="how-title" className="text-3xl font-bold">
              {content.howTitle}
            </h2>
            <ol className="mt-6">
              {content.steps.map((step, i) => (
                <li key={step.title} className="relative ps-12 pb-7 last:pb-0">
                  <span className="absolute start-0 top-0 grid size-9 place-items-center rounded-full bg-haldi font-display text-lg font-bold text-raat-deep">
                    {i + 1}
                  </span>
                  {i < content.steps.length - 1 && <span aria-hidden="true" className="absolute start-[17px] top-10 bottom-1 w-px bg-raat-line" />}
                  <h3 className="font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-1 text-abhla-dim">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-title" className="mt-14">
            <h2 id="faq-title" className="text-3xl font-bold">
              {content.faqTitle}
            </h2>
            <div className="mt-4 border-t border-raat-line">
              {content.faq.map((f) => (
                <details key={f.q} className="group border-b border-raat-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 12 12"
                      className="size-3 shrink-0 text-abhla-dim transition-transform group-open:rotate-180"
                    >
                      <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <p className="pb-4 text-abhla-dim">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

const icon = { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
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
