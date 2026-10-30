"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/config";
import { useT } from "@/lib/i18n";
import enLegal from "@/lib/locales/legal/en";
import { loadLegal } from "@/lib/locales/loaders";
import type { Legal } from "@/lib/locales/legal/types";

// `code` and {email} are the only inline markup the legal text uses.
function inline(text: string): ReactNode {
  return text.split(/(`[^`]+`|\{email\})/).map((part, i) => {
    if (part === "{email}") return <a key={i} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function LegalPage({ doc }: { doc: keyof Legal }) {
  const { lang, t } = useT();
  const [loaded, setLoaded] = useState<{ lang: string; legal: Legal }>({ lang: "en", legal: enLegal });

  useEffect(() => {
    let cancelled = false;
    loadLegal(lang)
      .then((legal) => !cancelled && setLoaded({ lang, legal }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const { title, updated, blocks } = loaded.legal[doc];
  return (
    <article className="max-w-[62ch] space-y-4 pt-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ms-5 [&_li]:list-disc [&_a]:text-haldi [&_a]:underline [&_a]:underline-offset-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-abhla-dim">{updated}</p>
      {lang !== "en" && <p className="text-sm text-abhla-dim">{t.legalNote}</p>}
      {blocks.map((b, i) =>
        "h" in b ? (
          <h2 key={i}>{b.h}</h2>
        ) : "p" in b ? (
          <p key={i}>{inline(b.p)}</p>
        ) : (
          <ul key={i} className="space-y-2">
            {b.ul.map((li, j) => (
              <li key={j}>{inline(li)}</li>
            ))}
          </ul>
        ),
      )}
    </article>
  );
}
