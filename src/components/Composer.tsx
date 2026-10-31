"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import DrawCanvas, { type DrawHandle } from "@/components/DrawCanvas";
import Knot from "@/components/Knot";
import { btnPrimary, btnQuiet, errorText, field } from "@/components/ui";
import { encryptPayload, generateLinkKey, type Payload } from "@/lib/crypto";
import { useT } from "@/lib/i18n";
import { fill, formatTime, MAX_SCHEDULE_MS, toLocalInput } from "@/lib/schedule";
import { addSent } from "@/lib/sent";
import { isTheme, THEME_KEY, THEME_SWATCH, THEMES, type Theme } from "@/lib/themes";

type Kind = "text" | "drawing";
const MAX_TEXT = 1000;
const MAX_HINT = 80;

export default function Composer() {
  const { lang, t } = useT();
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get("type") === "drawing" ? "drawing" : "text");
  const [text, setText] = useState("");
  const [usePhrase, setUsePhrase] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [hint, setHint] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // /new?theme=birthday comes from the occasion pages.
  const [theme, setTheme] = useState<Theme>(() => {
    const t = params.get("theme");
    return isTheme(t) ? t : "classic";
  });
  const [schedule, setSchedule] = useState(false);
  const [when, setWhen] = useState("");
  const [bounds, setBounds] = useState({ min: "", max: "" });
  const [result, setResult] = useState<{ url: string; phrase: boolean; opensAt?: number; theme: Theme } | null>(null);
  const [copied, setCopied] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);
  const [open, setOpen] = useState<"look" | "phrase" | "schedule" | null>(null);
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
    let opensAt: number | undefined;
    if (schedule) {
      opensAt = new Date(when).getTime();
      const now = Date.now();
      if (!when || Number.isNaN(opensAt) || opensAt < now + 30_000 || opensAt > now + MAX_SCHEDULE_MS) {
        return setError(t.errSchedule);
      }
    }
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
        body: JSON.stringify({
          ...blob,
          ...(usePhrase && hint.trim() ? { hint: hint.trim() } : {}),
          ...(opensAt ? { opensAt } : {}),
        }),
      });
      if (res.status === 429) return setError(t.errRate);
      if (!res.ok) return setError(res.status === 400 ? t.errTooLarge : t.errGeneric);
      const { id } = (await res.json()) as { id: string };
      // The language and look ride in the link fragment, so the receiver sees the same cloth. The server never gets them.
      const url = `${location.origin}/m/${id}#${key}.${lang}${theme === "classic" ? "" : `.${theme}`}`;
      addSent({ id, url, at: Date.now(), kind, hasPassphrase: usePhrase, opensAt, theme });
      setResult({ url, phrase: usePhrase, opensAt, theme });
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
    setSchedule(false);
    setWhen("");
    setTheme("classic");
  }

  if (result) {
    return (
      <div className="pt-6 text-center">
        <div className={`theme-${result.theme} mx-auto grid size-24 place-items-center`}>
          <span className="knot-pulse grid place-items-center rounded-full">
            <Knot className="size-20" />
          </span>
        </div>
        <h1 className="mt-5 text-4xl font-bold">{t.readyTitle}</h1>
        <p className="mx-auto mt-2 max-w-[40ch] text-abhla-dim">{t.readyNote}</p>
        {result.phrase && <p className="mx-auto mt-3 max-w-[40ch] font-semibold text-haldi">{t.readyPhrase}</p>}
        {result.opensAt && (
          <p className="mx-auto mt-3 max-w-[40ch] font-semibold text-haldi">{fill(t.opensOn, { time: formatTime(result.opensAt, lang) })}</p>
        )}

        <input
          readOnly
          value={result.url}
          aria-label={t.readyTitle}
          onFocus={(e) => e.currentTarget.select()}
          className={`${field} mt-6 text-center font-mono text-sm`}
        />

        <div className="mt-4 flex flex-col gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${t.shareText} ${result.url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            {t.whatsapp}
          </a>
          <button type="button" onClick={() => copy(result.url)} className={btnQuiet} aria-live="polite">
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6">
          <button type="button" onClick={reset} className="min-h-11 font-semibold text-haldi underline underline-offset-4">
            {t.another}
          </button>
          <Link href="/mine" className="inline-flex min-h-11 items-center font-semibold text-haldi underline underline-offset-4">
            {t.mineTitle}
          </Link>
        </div>
      </div>
    );
  }

  const toggle = (k: "look" | "phrase" | "schedule") => setOpen(open === k ? null : k);

  return (
    <form onSubmit={submit} className="pt-3" noValidate>
      <div role="tablist" className="grid grid-cols-2 rounded-full bg-raat-deep p-1">
        {(["text", "drawing"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`min-h-11 rounded-full px-4 font-display text-lg font-bold transition-colors ${
              kind === k ? "bg-haldi text-raat-deep" : "text-abhla-dim hover:text-abhla"
            }`}
          >
            {k === "text" ? t.tabWrite : t.tabDraw}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {kind === "text" ? (
          <div className="paper p-4 focus-within:ring-2 focus-within:ring-haldi">
            <label htmlFor="msg" className="sr-only">
              {t.messageLabel}
            </label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TEXT}
              rows={8}
              placeholder={t.messagePlaceholder}
              className="ruled block w-full resize-none bg-transparent text-siyahi placeholder:text-siyahi/45 focus:outline-none"
            />
            <p className="text-end text-sm text-siyahi/60">
              {text.length}/{MAX_TEXT}
            </p>
          </div>
        ) : (
          <div>
            <p className="sr-only">{t.drawLabel}</p>
            <DrawCanvas ref={draw} />
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-raat-line bg-raat-deep/60 px-4">
        <Row
          icon={<PaletteIcon />}
          title={t.themeLabel}
          summary={
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-3 rounded-full" style={{ background: THEME_SWATCH[theme].bg }} />
              {t[THEME_KEY[theme]]}
            </span>
          }
          open={open === "look"}
          onToggle={() => toggle("look")}
        >
          <div role="radiogroup" aria-label={t.themeLabel} className="grid grid-cols-3 gap-2">
            {THEMES.map((th) => (
              <button
                key={th}
                type="button"
                role="radio"
                aria-checked={theme === th}
                onClick={() => setTheme(th)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                  theme === th ? "border-haldi bg-haldi/10 text-abhla" : "border-raat-line text-abhla-dim hover:border-abhla-dim"
                }`}
              >
                <span aria-hidden="true" className="grid size-6 place-items-center rounded-full" style={{ background: THEME_SWATCH[th].bg }}>
                  <span className="size-2 rounded-full" style={{ background: THEME_SWATCH[th].dot }} />
                </span>
                {t[THEME_KEY[th]]}
              </button>
            ))}
          </div>
        </Row>

        <Row
          icon={<LockIcon />}
          title={t.phraseToggle}
          summary={usePhrase ? t.switchOn : t.switchOff}
          open={open === "phrase"}
          onToggle={() => toggle("phrase")}
        >
          <p className="text-sm text-abhla-dim">{t.phraseIntro}</p>
          <Switch on={usePhrase} onChange={setUsePhrase} label={t.phraseToggle} onText={t.switchOn} offText={t.switchOff} />
          {usePhrase && (
            <div className="mt-1 space-y-4">
              <p className="text-sm text-abhla-dim">{t.phraseHelp}</p>
              <div>
                <label htmlFor="phrase" className="mb-1 block text-sm font-semibold">
                  {t.phraseLabel}
                </label>
                <input id="phrase" type="text" autoComplete="off" value={phrase} onChange={(e) => setPhrase(e.target.value)} className={field} />
              </div>
              <div>
                <label htmlFor="hint" className="mb-1 block text-sm font-semibold">
                  {t.hintLabel}
                </label>
                <input id="hint" type="text" maxLength={MAX_HINT} value={hint} onChange={(e) => setHint(e.target.value)} className={field} />
                <p className="mt-1 text-sm text-abhla-dim">{t.hintHelp}</p>
              </div>
            </div>
          )}
        </Row>

        <Row
          icon={<ClockIcon />}
          title={t.scheduleToggle}
          summary={schedule && when ? formatTime(new Date(when).getTime(), lang) : t.switchOff}
          open={open === "schedule"}
          onToggle={() => toggle("schedule")}
        >
          <p className="text-sm text-abhla-dim">{t.scheduleIntro}</p>
          <Switch
            on={schedule}
            onChange={(next) => {
              setSchedule(next);
              if (next) {
                const now = Date.now();
                setBounds({ min: toLocalInput(now), max: toLocalInput(now + MAX_SCHEDULE_MS) });
                // Default to the next midnight: the classic birthday wish.
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                if (!when) setWhen(toLocalInput(midnight.getTime()));
              }
            }}
            label={t.scheduleToggle}
            onText={t.switchOn}
            offText={t.switchOff}
          />
          {schedule && (
            <div className="mt-1">
              <label htmlFor="when" className="mb-1 block text-sm font-semibold">
                {t.scheduleLabel}
              </label>
              <input id="when" type="datetime-local" value={when} min={bounds.min} max={bounds.max} onChange={(e) => setWhen(e.target.value)} className={field} />
            </div>
          )}
        </Row>
      </div>

      <label
        ref={consentRef}
        className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm transition-colors ${
          consentMissing ? "bg-bandhani/15 ring-1 ring-bandhani" : ""
        }`}
      >
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
        <span className="text-abhla-dim">
          {t.consent}{" "}
          <Link href="/privacy" target="_blank" className="text-haldi underline underline-offset-4">
            {t.privacy}
          </Link>
          {" · "}
          <Link href="/terms" target="_blank" className="text-haldi underline underline-offset-4">
            {t.terms}
          </Link>
        </span>
      </label>

      {/* The button stays in reach on a long form. */}
      <div className="sticky bottom-0 -mx-4 mt-2 bg-gradient-to-t from-raat via-raat/95 to-transparent px-4 pb-4 pt-6">
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? t.creating : t.create}
        </button>
        {error && (
          <p role="alert" className={errorText}>
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

/** One line of the "make it special" list: a title, what is chosen now, and a panel that opens underneath. */
function Row({
  icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  summary: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-raat-line first:border-t-0">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-14 w-full items-center gap-3 py-2 text-start">
        <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-raat text-haldi">
          {icon}
        </span>
        <span className="flex-1 font-semibold">{title}</span>
        <span className="text-sm text-abhla-dim">{summary}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`size-3 shrink-0 text-abhla-dim transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="space-y-3 pb-4 ps-12">{children}</div>}
    </div>
  );
}

function Switch({
  on,
  onChange,
  label,
  onText,
  offText,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  onText: string;
  offText: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="flex min-h-11 w-full items-center gap-3 text-start"
    >
      <span aria-hidden="true" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-haldi" : "bg-raat-line"}`}>
        <span className={`absolute top-0.5 size-6 rounded-full bg-white transition-all ${on ? "start-[22px]" : "start-0.5"}`} />
      </span>
      <span className="text-sm font-semibold">{on ? onText : offText}</span>
    </button>
  );
}

const icon = { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const PaletteIcon = () => (
  <svg {...icon}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10.5" cy="7" r="1" />
    <circle cx="15" cy="7.5" r="1" />
  </svg>
);
const LockIcon = () => (
  <svg {...icon}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const ClockIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
