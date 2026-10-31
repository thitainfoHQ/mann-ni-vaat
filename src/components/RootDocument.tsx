import type { ReactNode } from "react";
import AnalyticsScrubbed from "@/components/AnalyticsScrubbed";
import { fontClasses } from "@/app/fonts";
import type { Lang } from "@/lib/languages";
import { dirFor } from "@/lib/seo";
import "@/app/globals.css";

/** The <html> and <body> shared by both root layouts (English pages and the per-language home pages). */
export default function RootDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} dir={dirFor(lang)} className={fontClasses}>
      <body className="min-h-dvh">
        {children}
        <AnalyticsScrubbed />
      </body>
    </html>
  );
}
