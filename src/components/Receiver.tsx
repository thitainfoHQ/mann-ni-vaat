"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Cloth from "@/components/Cloth";
import Loading from "@/components/Loading";
import ReportPanel from "@/components/ReportPanel";
import { btnPrimary, errorText, field } from "@/components/ui";
import { decryptPayload, type Payload } from "@/lib/crypto";
import { useT } from "@/lib/i18n";
import { parseLinkFragment } from "@/lib/languages";
import { fill, formatCountdown, formatTime } from "@/lib/schedule";
import { THEME_KEY, type Theme } from "@/lib/themes";

type Meta = { hasPassphrase: boolean; salt?: string; hint?: string; opensAt?: number; now?: number };
type Phase = "checking" | "gone" | "incomplete" | "ready" | "opened";

const SAFE_IMAGE = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/;

export default function Receiver({ id }: { id: string }) {
  const { t, lang } = useT();
  const [phase, setPhase] = useState<Phase>("checking");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [theme, setTheme] = useState<Theme>("classic");
  // The server's clock, so a scheduled reveal counts down to the right moment even if the phone's clock is off.
  const [skew, setSkew] = useState(0);
  const [now, setNow] = useState(0);
  const linkKey = useRef("");
  // Once fetched, the server copy is gone, so keep the ciphertext here to allow phrase retries.
  const fetched = useRef<string | null>(null);

  useEffect(() => {
    const { key, theme: linkTheme } = parseLinkFragment(location.hash);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(linkTheme);
    if (key.length < 40) {
      setPhase("incomplete");
      return;
    }
    linkKey.current = key;
    let cancelled = false;
    fetch(`/api/meta/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) return setPhase("gone");
        const m = (await res.json()) as Meta;
        syncClock(m.now);
        setMeta(m);
        setPhase("ready");
      })
      .catch(() => !cancelled && setError(t.errNetwork));
    return () => {
      cancelled = true;
    };
    // t only feeds the error text; the check itself must run once per id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function syncClock(serverNow?: number) {
    const n = serverNow ?? Date.now();
    setSkew(n - Date.now());
    setNow(n);
  }

  const opensAt = meta?.opensAt;
  useEffect(() => {
    if (!opensAt) return;
    const timer = setInterval(() => {
      const n = Date.now() + skew;
      setNow(n);
      if (n >= opensAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [opensAt, skew]);

  async function untie() {
    if (!meta || busy) return;
    setError("");
    setBusy(true);
    try {
      if (!fetched.current) {
        const res = await fetch(`/api/open/${id}`, { method: "POST", cache: "no-store" });
        if (res.status === 404) return setPhase("gone");
        if (res.status === 425) {
          // Not time yet: the server kept the secret. Follow its clock and keep waiting.
          const early = (await res.json()) as { opensAt: number; now: number };
          syncClock(early.now);
          setMeta({ ...meta, opensAt: early.opensAt });
          return setError(t.notYet);
        }
        if (!res.ok) return setError(t.errGeneric);
        fetched.current = ((await res.json()) as { ct: string }).ct;
      }
      try {
        const opened = await decryptPayload(
          { ct: fetched.current, salt: meta.salt },
          linkKey.current,
          meta.hasPassphrase ? phrase.trim() : undefined,
        );
        setPayload(opened);
        setPhase("opened");
        fetched.current = null;
      } catch {
        setError(meta.hasPassphrase ? t.errWrongPhrase : t.errBroken);
      }
    } catch {
      setError(t.errNetwork);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "checking") {
    return <Loading label={error || t.checking} />;
  }

  if (phase === "gone" || phase === "incomplete") {
    return (
      <div className="pt-8">
        <h1 className="text-3xl font-bold">{phase === "gone" ? t.goneTitle : t.incompleteTitle}</h1>
        <p className="mt-2 max-w-[44ch]">{phase === "gone" ? t.goneBody : t.incompleteBody}</p>
        <Link href="/new" className={`${btnPrimary} mt-6`}>
          {t.goneCta}
        </Link>
      </div>
    );
  }

  const locked = !!opensAt && now < opensAt;
  const canUntie = !busy && !locked && (!meta?.hasPassphrase || phrase.trim().length > 0);

  return (
    <div className="pt-2">
      <Cloth untied={phase === "opened"} onTap={canUntie ? untie : undefined} theme={theme}>
        {payload?.kind === "text" && (
          <p className="whitespace-pre-wrap break-words font-display text-2xl font-bold leading-snug text-abhla">
            {payload.text}
          </p>
        )}
        {payload?.kind === "drawing" &&
          (SAFE_IMAGE.test(payload.image) ? (
            // A data: URL we just decrypted; next/image can't optimise it.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={payload.image} alt="" className="mx-auto block w-full rounded-xl" />
          ) : (
            <p>{t.errBroken}</p>
          ))}
      </Cloth>

      {phase === "ready" ? (
        <div className="mt-6">
          {theme !== "classic" && (
            <p className="mb-2 inline-block rounded-full border border-haldi/50 px-3 py-0.5 text-sm font-semibold text-haldi">
              {t[THEME_KEY[theme]]}
            </p>
          )}
          <h1 className="text-3xl font-bold">{t.waitingTitle}</h1>
          <p className="mt-2 max-w-[44ch] text-abhla-dim">{t.waitingBody}</p>
          {opensAt && (
            <div className="mt-4 rounded-xl border border-raat-line p-4">
              <p className="font-semibold">{fill(t.opensOn, { time: formatTime(opensAt, lang) })}</p>
              {locked && (
                <>
                  <p className="mt-2 text-sm text-abhla-dim">{t.timeLeft}</p>
                  <p role="timer" className="font-mono text-3xl font-bold text-haldi">
                    {formatCountdown(opensAt - now)}
                  </p>
                </>
              )}
            </div>
          )}
          <p role="note" className="mt-4 max-w-[44ch] rounded-xl border border-haldi/40 bg-haldi/10 p-3 text-sm">
            {t.safetyNotice}
          </p>

          {meta?.hasPassphrase && (
            <div className="mt-5">
              {meta.hint && (
                <p className="mb-2">
                  <span className="font-semibold text-haldi">{t.hintPrefix}:</span> {meta.hint}
                </p>
              )}
              <label htmlFor="phrase" className="mb-1 block text-sm font-semibold">
                {t.phraseEnter}
              </label>
              <input
                id="phrase"
                type="text"
                autoComplete="off"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canUntie && untie()}
                className={field}
              />
            </div>
          )}

          <button type="button" onClick={untie} disabled={!canUntie} className={`${btnPrimary} mt-5 w-full`}>
            {busy ? t.untying : t.untie}
          </button>
          {error && (
            <p role="alert" className={errorText}>
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6" aria-live="polite">
          <p className="max-w-[44ch] text-abhla-dim">{t.openedNote}</p>
          <Link href="/new" className={`${btnPrimary} mt-5`}>
            {t.sendBack}
          </Link>
          {payload && <ReportPanel payload={payload} />}
        </div>
      )}
    </div>
  );
}
