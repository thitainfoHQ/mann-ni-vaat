"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Cloth from "@/components/Cloth";
import { btnPrimary, errorText, field } from "@/components/ui";
import { decryptPayload, type Payload } from "@/lib/crypto";
import { useT } from "@/lib/i18n";

type Meta = { hasPassphrase: boolean; salt?: string; hint?: string };
type Phase = "checking" | "gone" | "incomplete" | "ready" | "opened";

const SAFE_IMAGE = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/;

export default function Receiver({ id }: { id: string }) {
  const { t } = useT();
  const [phase, setPhase] = useState<Phase>("checking");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<Payload | null>(null);
  const linkKey = useRef("");
  // Once fetched, the server copy is gone, so keep the ciphertext here to allow phrase retries.
  const fetched = useRef<string | null>(null);

  useEffect(() => {
    const key = location.hash.slice(1);
    if (key.length < 40) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("incomplete");
      return;
    }
    linkKey.current = key;
    let cancelled = false;
    fetch(`/api/meta/${id}`, { cache: "no-store" })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) return setPhase("gone");
        setMeta((await res.json()) as Meta);
        setPhase("ready");
      })
      .catch(() => !cancelled && setError(t.errNetwork));
    return () => {
      cancelled = true;
    };
    // t only feeds the error text; the check itself must run once per id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function untie() {
    if (!meta || busy) return;
    setError("");
    setBusy(true);
    try {
      if (!fetched.current) {
        const res = await fetch(`/api/open/${id}`, { method: "POST", cache: "no-store" });
        if (res.status === 404) return setPhase("gone");
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
    return <p className="pt-8 text-abhla-dim">{error || t.checking}</p>;
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

  const canUntie = !busy && (!meta?.hasPassphrase || phrase.trim().length > 0);

  return (
    <div className="pt-2">
      <Cloth untied={phase === "opened"} onTap={canUntie ? untie : undefined}>
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
          <h1 className="text-3xl font-bold">{t.waitingTitle}</h1>
          <p className="mt-2 max-w-[44ch] text-abhla-dim">{t.waitingBody}</p>

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
        </div>
      )}
    </div>
  );
}
