// Occasion looks for the cloth. The theme only travels in the link fragment (never to the server) and only changes colours.
export const THEMES = ["classic", "diwali", "birthday", "anniversary", "sorry", "missyou"] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (v: unknown): v is Theme => typeof v === "string" && (THEMES as readonly string[]).includes(v);

/** Swatch colours for the picker. They match the `.theme-*` rules in globals.css. */
export const THEME_SWATCH: Record<Theme, { bg: string; dot: string }> = {
  classic: { bg: "#e0384f", dot: "#f4b83d" },
  diwali: { bg: "#c2410c", dot: "#ffd166" },
  birthday: { bg: "#db2777", dot: "#fde68a" },
  anniversary: { bg: "#7f1d1d", dot: "#f9a8d4" },
  sorry: { bg: "#334155", dot: "#cbd5e1" },
  missyou: { bg: "#4338ca", dot: "#c7d2fe" },
};

import type { Dict } from "./locales/en";

/** Which dictionary key names each theme. */
export const THEME_KEY: Record<Theme, keyof Dict> = {
  classic: "themeClassic",
  diwali: "themeDiwali",
  birthday: "themeBirthday",
  anniversary: "themeAnniversary",
  sorry: "themeSorry",
  missyou: "themeMissYou",
};
