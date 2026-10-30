import en from "./en";
import type { Dict } from "./en";

// TODO: needs a native sat translator. Until then this falls back to English, and the language is a hidden draft
// (see `draft` in src/lib/languages.ts). The script's font is already wired up in layout.tsx.
const sat: Dict = { ...en };

export default sat;
