"use client";

import type { ReactNode } from "react";

// Deliberately English in every language: short, universal, and the one cue people need on the cloth.
const TAP_LABEL = "Tap to open";

const COLS = 7;
const ROWS = 9;

// Dots dissolve outward from the knot at the centre: delay grows with distance.
const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const dist = Math.hypot(c - (COLS - 1) / 2, r - (ROWS - 1) / 2);
  return Math.round(dist * 85);
});

function Knot() {
  return (
    <svg viewBox="0 0 64 64" className="knot size-16" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#b32339" />
      <path
        d="M20 38c0-9 7-15 14-15 6 0 10 4 10 9 0 6-5 9-10 9-4 0-7-2-7-5 0-3 2-5 5-5"
        fill="none"
        stroke="#f4b83d"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="2.5" fill="#f4b83d" />
    </svg>
  );
}

/**
 * A secret tied up in bandhani cloth. `untied` dissolves the dots, then the cloth,
 * revealing `children` underneath.
 */
export default function Cloth({
  untied,
  onTap,
  children,
}: {
  untied: boolean;
  onTap?: () => void;
  children: ReactNode;
}) {
  const interactive = !untied && !!onTap;
  return (
    <div className={`relative isolate overflow-hidden rounded-[22px] bg-raat-deep ${untied ? "untied" : ""}`}>
      <div className="relative z-0 flex min-h-[26rem] flex-col justify-center p-6">{children}</div>

      <div
        className={`cloth absolute inset-0 z-10 ${untied ? "pointer-events-none" : onTap ? "cursor-pointer" : ""}`}
        onClick={untied ? undefined : onTap}
        {...(interactive
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": TAP_LABEL,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTap?.();
                }
              },
            }
          : { "aria-hidden": true })}
      >
        <div className="grid h-full w-full place-items-center" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
          {cells.map((delay, i) => (
            <span key={i} className="rosette" style={{ ["--d" as string]: `${delay}ms` }} />
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className={interactive ? "knot-pulse grid place-items-center rounded-full" : "grid place-items-center"}>
            <Knot />
          </span>
        </div>
        {interactive && (
          <span className="tap-pill absolute inset-x-0 bottom-[16%] mx-auto w-fit rounded-full bg-haldi px-5 py-2 font-display text-lg font-bold text-raat-deep shadow-lg">
            {TAP_LABEL}
          </span>
        )}
      </div>
    </div>
  );
}
