"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { btnPrimary, btnQuiet } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { fill, formatTime } from "@/lib/schedule";
import { finish, loadSent, prune, saveSent, type SentEntry } from "@/lib/sent";
import { THEME_KEY } from "@/lib/themes";

/** Everything on this page comes from this browser. The only server calls are the same harmless status checks a receiver makes. */
export default function MySecrets() {
  const { t, lang } = useT();
  const [list, setList] = useState<SentEntry[] | null>(null);
  const [checkedAt] = useState(() => Date.now());
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;
    const stored = prune(loadSent());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(stored);

    // Ask the server which waiting secrets still exist. "Not found" means it was opened (or has expired).
    Promise.all(
      stored.map(async (e) => {
        if (e.done) return e;
        try {
          const res = await fetch(`/api/meta/${e.id}`, { cache: "no-store" });
          return res.status === 404 ? finish(e) : e;
        } catch {
          return e; // offline or rate limited: leave it as waiting
        }
      }),
    ).then((next) => {
      if (cancelled) return;
      saveSent(next);
      setList(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(next: SentEntry[]) {
    saveSent(next);
    setList(next);
  }

  async function copy(e: SentEntry) {
    if (!e.url) return;
    try {
      await navigator.clipboard.writeText(e.url);
      setCopied(e.id);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      /* nothing to fall back to; the link is still on the ready screen when it is made */
    }
  }

  const status = (e: SentEntry) =>
    e.done === "opened" ? t.statusOpened : e.done === "expired" ? t.statusExpired : e.opensAt && e.opensAt > checkedAt
      ? fill(t.opensOn, { time: formatTime(e.opensAt, lang) })
      : t.statusWaiting;

  return (
    <div className="pt-4">
      <h1 className="text-3xl font-bold">{t.mineTitle}</h1>
      <p className="mt-2 max-w-[44ch] text-abhla-dim">{t.mineIntro}</p>

      {list && list.length === 0 && (
        <div className="mt-6">
          <p>{t.mineEmpty}</p>
          <Link href="/new" className={`${btnPrimary} mt-4`}>
            {t.goneCta}
          </Link>
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {list?.map((e) => (
          <li key={e.id} className="rounded-[18px] border border-raat-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {e.kind === "text" ? t.tabWrite : t.tabDraw}
                  {e.theme !== "classic" && <span className="text-abhla-dim"> · {t[THEME_KEY[e.theme]]}</span>}
                </p>
                <p className="text-sm text-abhla-dim">{fill(t.mineMade, { time: formatTime(e.at, lang) })}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  e.done ? "border border-raat-line text-abhla-dim" : "bg-haldi text-raat-deep"
                }`}
              >
                {status(e)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {e.url && (
                <>
                  <button type="button" onClick={() => copy(e)} className={`${btnQuiet} min-h-11 px-4 text-sm`} aria-live="polite">
                    {copied === e.id ? t.copied : t.copy}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${t.shareText} ${e.url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${btnQuiet} min-h-11 px-4 text-sm`}
                  >
                    {t.whatsapp}
                  </a>
                </>
              )}
              <button
                type="button"
                onClick={() => update((list ?? []).filter((x) => x.id !== e.id))}
                className="min-h-11 px-3 text-sm text-abhla-dim underline underline-offset-4 hover:text-abhla"
              >
                {t.mineRemove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {list && list.length > 1 && (
        <button
          type="button"
          onClick={() => update([])}
          className="mt-6 min-h-11 text-sm text-abhla-dim underline underline-offset-4 hover:text-abhla"
        >
          {t.mineClear}
        </button>
      )}
    </div>
  );
}
