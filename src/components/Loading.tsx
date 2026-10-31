"use client";

import Knot from "@/components/Knot";
import { useT } from "@/lib/i18n";

/** The app's own loading state: the knot, gently turning. Used wherever a page or the link check is loading. */
export default function Loading({ label }: { label?: string }) {
  const { t } = useT();
  return (
    <div role="status" aria-live="polite" className="grid min-h-[45vh] place-items-center">
      <div className="flex flex-col items-center gap-5">
        <span className="knot-pulse grid place-items-center rounded-full">
          <Knot className="loading-knot size-16" />
        </span>
        <p className="text-sm text-abhla-dim">{label ?? t.brand}</p>
      </div>
    </div>
  );
}
