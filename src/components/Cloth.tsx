"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import Knot from "@/components/Knot";
import type { Theme } from "@/lib/themes";

const COLS = 7;

// Dots dissolve outward from the knot at the centre: delay grows with distance.
function makeCells(rows: number) {
  return Array.from({ length: COLS * rows }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    return Math.round(Math.hypot(c - (COLS - 1) / 2, r - (rows - 1) / 2) * 85);
  });
}
// Rows follow the cloth's height so the dots stay evenly spaced.
const FULL = { rows: 9, cells: makeCells(9) };
const SHORT = { rows: 5, cells: makeCells(5) };

/**
 * A secret tied up in bandhani cloth. `untied` dissolves the dots, then the cloth,
 * revealing `children` underneath.
 */
export default function Cloth({
  untied,
  onTap,
  theme = "classic",
  compact = false,
  children,
}: {
  untied: boolean;
  onTap?: () => void;
  theme?: Theme;
  /** A shorter cloth for the home page demo; the receiver needs room for the whole message. */
  compact?: boolean;
  children: ReactNode;
}) {
  const { t } = useT();
  const interactive = !untied && !!onTap;
  const { rows, cells } = compact ? SHORT : FULL;
  return (
    <div className={`relative isolate overflow-hidden rounded-[26px] bg-raat-deep shadow-[0_26px_60px_-28px_var(--cloth-bg)] theme-${theme} ${untied ? "untied" : ""}`}>
      <div className={`relative z-0 flex ${compact ? "min-h-[17rem]" : "min-h-[26rem]"} flex-col justify-center p-6`}>{children}</div>

      <div
        className={`cloth absolute inset-0 z-10 ${untied ? "pointer-events-none" : onTap ? "cursor-pointer" : ""}`}
        onClick={untied ? undefined : onTap}
        {...(interactive
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": t.tapToOpen,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap?.();
                }
              },
            }
          : { "aria-hidden": true })}
      >
        <div className="grid h-full w-full place-items-center" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
          {cells.map((delay, i) => (
            <span key={i} className="rosette" style={{ ["--d" as string]: `${delay}ms` }} />
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className={interactive ? "knot-pulse grid place-items-center rounded-full" : "grid place-items-center"}>
            <Knot className="knot size-16" />
          </span>
        </div>
        {interactive && (
          <span className="tap-pill absolute inset-x-0 bottom-[16%] mx-auto w-fit rounded-full bg-haldi px-5 py-2 font-display text-lg font-bold text-raat-deep shadow-lg">
            {t.tapToOpen}
          </span>
        )}
      </div>
    </div>
  );
}
