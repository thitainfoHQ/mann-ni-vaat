"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import DrawCanvas, { type DrawHandle } from "@/components/DrawCanvas";
import { btnPrimary, btnQuiet, errorText, field } from "@/components/ui";
import { encryptPayload, generateLinkKey, type Payload } from "@/lib/crypto";
import { useT } from "@/lib/i18n";

type Kind = "text" | "drawing";
const MAX_TEXT = 1000;
const MAX_HINT = 80;

export default function Composer() {
  const { lang, t } = useT();
  const [kind, setKind] = useState<Kind>(useSearchParams().get("type") === "drawing" ? "drawing" : "text");
  const [text, setText] = useState("");
  const [usePhrase, setUsePhrase] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [hint, setHint] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; phrase: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);
  const draw = useRef<DrawHandle>(null);
  const consentRef = useRef<HTMLLabelElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let payload: Payload;
    if (kind === "text") {
      if (!text.trim()) return setError(t.errEmptyText);
      payload = { v: 1, kind: "text", lang, text: text.trim() };
    } else {
      if (!draw.current || draw.current.isEmpty()) return setError(t.errEmptyDraw);
      const image = draw.current.exportImage();
      if (!image) return setError(t.errTooLarge);
      payload = { v: 1, kind: "drawing", lang, image };
    }
    if (usePhrase && phrase.trim().length < 4) return setError(t.errPhraseShort);
    if (!consent) {
      setConsentMissing(true);
      consentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return setError(t.errConsent);
    }

    setBusy(true);
    try {
      const key = generateLinkKey();
      const blob = await encryptPayload(payload, key, usePhrase ? phrase.trim() : undefined);
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...blob, ...(usePhrase && hint.trim() ? { hint: hint.trim() } : {}) }),
      });
      if (res.status === 429) return setError(t.errRate);
      if (!res.ok) return setError(res.status === 400 ? t.errTooLarge : t.errGeneric);
      const { id } = (await res.json()) as { id: string };
      setResult({ url: `${location.origin}/m/${id}#${key}`, phrase: usePhrase });
    } catch (err) {
      setError(err instanceof TypeError ? t.errNetwork : t.errGeneric);
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the link is shown selectable in the field below */
    }
  }

  function reset() {
    setResult(null);
    setText("");
    setPhrase("");
    setHint("");
    setUsePhrase(false);
    setConsent(false);
    setConsentMissing(false);
    setCopied(false);
  }

  if (result) {
    return (
      <div className="pt-4">
        <h1 className="text-3xl font-bold">{t.readyTitle}</h1>
        <p className="mt-2 max-w-[44ch]">{t.readyNote}</p>
        {result.phrase && <p className="mt-2 max-w-[44ch] font-semibold text-haldi">{t.readyPhrase}</p>}

        <input
          readOnly
          value={result.url}
          aria-label={t.readyTitle}
          onFocus={(e) => e.currentTarget.select()}
          className={`${field} mt-5 font-mono text-sm`}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${t.shareText} ${result.url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimary} sm:flex-1`}
          >
            {t.whatsapp}
          </a>
          <button type="button" onClick={() => copy(result.url)} className={`${btnQuiet} sm:flex-1`} aria-live="polite">
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <button type="button" onClick={reset} className="mt-5 min-h-11 font-semibold text-haldi underline underline-offset-4">
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="pt-2" noValidate>
      <div role="tablist" className="flex gap-2">
        {(["text", "drawing"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`min-h-11 flex-1 rounded-xl border px-4 font-display text-lg font-bold transition-colors ${
              kind === k ? "border-haldi bg-haldi text-raat-deep" : "border-raat-line text-abhla hover:border-abhla-dim"
            }`}
          >
            {k === "text" ? t.tabWrite : t.tabDraw}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {kind === "text" ? (
          <div>
            <label htmlFor="msg" className="mb-2 block font-semibold">
              {t.messageLabel}
            </label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TEXT}
              rows={7}
              placeholder={t.messagePlaceholder}
              className={`${field} resize-y`}
            />
            <p className="mt-1 text-right text-sm text-abhla-dim">
              {text.length}/{MAX_TEXT}
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-2 font-semibold">{t.drawLabel}</p>
            <DrawCanvas ref={draw} />
          </div>
        )}
      </div>

      <section aria-labelledby="phrase-title" className="mt-6 rounded-[18px] border border-dashed border-raat-line p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="phrase-title" className="font-display text-lg font-bold">
              {t.phraseToggle}
            </h2>
            <p className="mt-0.5 text-sm text-abhla-dim">{t.phraseIntro}</p>
          </div>
          <span className="shrink-0 rounded-full border border-raat-line px-2.5 py-0.5 text-xs font-semibold text-abhla-dim">
            {t.optionalBadge}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={usePhrase}
          aria-labelledby="phrase-title"
          onClick={() => setUsePhrase(!usePhrase)}
          className="mt-3 flex min-h-11 w-full items-center gap-3 text-left"
        >
          <span
            aria-hidden="true"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${usePhrase ? "bg-haldi" : "bg-raat-line"}`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-white transition-all ${usePhrase ? "left-[22px]" : "left-0.5"}`}
            />
          </span>
          <span className="text-sm font-semibold">{usePhrase ? t.switchOn : t.switchOff}</span>
        </button>
        {usePhrase && (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-abhla-dim">{t.phraseHelp}</p>
            <div>
              <label htmlFor="phrase" className="mb-1 block text-sm font-semibold">
                {t.phraseLabel}
              </label>
              <input
                id="phrase"
                type="text"
                autoComplete="off"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="hint" className="mb-1 block text-sm font-semibold">
                {t.hintLabel}
              </label>
              <input
                id="hint"
                type="text"
                maxLength={MAX_HINT}
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className={field}
              />
              <p className="mt-1 text-sm text-abhla-dim">{t.hintHelp}</p>
            </div>
          </div>
        )}
      </section>

      <section
        aria-labelledby="agree-title"
        className={`mt-6 rounded-[18px] border p-4 transition-colors ${consentMissing ? "border-bandhani bg-bandhani/10" : "border-raat-line"}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="agree-title" className="font-display text-lg font-bold">
            {t.beforeCreate}
          </h2>
          <span className="shrink-0 rounded-full bg-haldi px-2.5 py-0.5 text-xs font-bold text-raat-deep">
            {t.requiredBadge}
          </span>
        </div>
        <label ref={consentRef} className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setConsentMissing(false);
            }}
            aria-invalid={consentMissing}
            className="mt-0.5 size-5 shrink-0 accent-[#f4b83d]"
          />
          <span>{t.consent}</span>
        </label>
        <p className="mt-2 pl-8 text-sm text-abhla-dim">
          {t.readFirst}{" "}
          <Link href="/privacy" target="_blank" className="text-haldi underline underline-offset-4">
            {t.privacy}
          </Link>
          {" · "}
          <Link href="/terms" target="_blank" className="text-haldi underline underline-offset-4">
            {t.terms}
          </Link>
        </p>
      </section>

      <button type="submit" disabled={busy} className={`${btnPrimary} mt-6 w-full`}>
        {busy ? t.creating : t.create}
      </button>
      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}
    </form>
  );
}
