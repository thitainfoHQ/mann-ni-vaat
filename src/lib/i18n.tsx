"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import en, { type Dict } from "./locales/en";
import { loadDict } from "./locales/loaders";
import { isLang, isRtl, matchLang, parseLinkFragment, type Lang } from "./languages";

export { LANGS, PICKER_LANGS, type Lang } from "./languages";
export type { Dict };

// `selected` is what the picker shows and changes instantly; `lang` and `t` follow once that language has loaded.
type Ctx = { lang: Lang; selected: Lang; setLang: (l: Lang) => void; t: Dict };
const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "mnv-lang";

function saved(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

function fromBrowser(): Lang {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const m = matchLang(tag);
    if (m) return m;
  }
  return "en";
}

/**
 * `initial` is used by the per-language home pages: the page is already in that language (so search engines
 * and first paint see it), and the browser's saved or detected language must not replace it.
 */
export function LangProvider({ children, initial }: { children: ReactNode; initial?: { lang: Lang; dict: Dict } }) {
  const [lang, setLangState] = useState<Lang>(initial?.lang ?? "en");
  const [selected, setSelected] = useState<Lang>(initial?.lang ?? "en");
  const [t, setT] = useState<Dict>(initial?.dict ?? en);
  const latest = useRef(0);
  const applied = useRef<Lang>(initial?.lang ?? "en");

  // The picker updates at once; the text switches when the language's chunk arrives.
  // Only the newest request wins, so quick successive picks can't land out of order.
  const apply = useCallback((next: Lang) => {
    setSelected(next);
    const id = ++latest.current;
    loadDict(next)
      .then((d) => {
        if (id !== latest.current) return;
        applied.current = next;
        setT(d);
        setLangState(next);
      })
      .catch(() => {
        // Offline or the chunk failed: put the picker back on the language that is still on screen.
        if (id === latest.current) setSelected(applied.current);
      });
  }, []);

  useEffect(() => {
    if (initial) {
      // Someone who lands on /hi chose Hindi: keep it for the rest of the site.
      try {
        localStorage.setItem(STORAGE_KEY, initial.lang);
      } catch {}
      return;
    }
    // Language lives in localStorage, which the server can't read, so apply it after mount.
    // Order: the visitor's own choice, then the sender's language from a secret link (#key.lang), then the browser's.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    apply(saved() ?? parseLinkFragment(location.hash).lang ?? fromBrowser());
  }, [apply, initial]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      apply(l);
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {}
    },
    [apply],
  );

  const value = useMemo(() => ({ lang, selected, setLang, t }), [lang, selected, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LangProvider");
  return ctx;
}
