"use client";

import Link from "next/link";
import { useState } from "react";
import Cloth from "@/components/Cloth";
import { btnPrimary, btnQuiet } from "@/components/ui";
import { useT } from "@/lib/i18n";
import type { HomeContent } from "@/lib/locales/home/types";

export default function Home({ content }: { content?: HomeContent | null }) {
  const { t } = useT();
  const [untied, setUntied] = useState(false);

  return (
    <div className="pt-2">
      <Cloth untied={untied} onTap={() => setUntied(true)}>
        <p className="text-center font-display text-2xl font-bold leading-snug text-abhla">{t.demoOpened}</p>
        <button
          type="button"
          onClick={() => setUntied(false)}
          className="mx-auto mt-5 min-h-11 px-4 font-semibold text-haldi underline underline-offset-4"
        >
          {t.demoAgain}
        </button>
      </Cloth>

      <h1 className="mt-8 text-4xl font-bold sm:text-5xl">{t.tagline}</h1>
      <p className="mt-3 max-w-[34ch] text-abhla-dim">{t.intro}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/new?type=text" className={`${btnPrimary} sm:flex-1`}>
          {t.writeCta}
        </Link>
        <Link href="/new?type=drawing" className={`${btnQuiet} sm:flex-1`}>
          {t.drawCta}
        </Link>
      </div>

      <ul className="mt-8 space-y-3">
        {[t.fact1, t.fact2, t.fact3].map((f) => (
          <li key={f} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.7em] size-2 shrink-0 rounded-full bg-haldi" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {content && (
        <>
          <section aria-labelledby="how-title" className="mt-12">
            <h2 id="how-title" className="text-2xl font-bold">
              {content.howTitle}
            </h2>
            <ol className="mt-4 space-y-4">
              {content.steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-haldi font-display font-bold text-raat-deep">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">{step.title}</h3>
                    <p className="text-abhla-dim">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-title" className="mt-12">
            <h2 id="faq-title" className="text-2xl font-bold">
              {content.faqTitle}
            </h2>
            <div className="mt-4 space-y-5">
              {content.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-display text-lg font-bold">{f.q}</h3>
                  <p className="mt-1 text-abhla-dim">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
