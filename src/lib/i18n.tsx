"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en, { type Dict } from "./locales/en";
import { loadDict } from "./locales/loaders";
import { isLang, isRtl, matchLang, parseLinkFragment, type Lang } from "./languages";

export { LANGS, PICKER_LANGS, type Lang } from "./languages";
export type { Dict };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
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

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [t, setT] = useState<Dict>(en);

  // Shows `next` once its chunk has arrived; until then the current language stays on screen.
  const apply = useCallback((next: Lang) => {
    loadDict(next)
      .then((d) => {
        setT(d);
        setLangState(next);
      })
      .catch(() => {
        /* offline or chunk failed: keep the current language */
      });
  }, []);

  useEffect(() => {
    // Language lives in localStorage, which the server can't read, so apply it after mount.
    // Order: the visitor's own choice, then the sender's language from a secret link (#key.lang), then the browser's.
    apply(saved() ?? parseLinkFragment(location.hash).lang ?? fromBrowser());
  }, [apply]);

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

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LangProvider");
  return ctx;
}
