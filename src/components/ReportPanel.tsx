"use client";

import { useState } from "react";
import { btnPrimary, errorText } from "@/components/ui";
import { useT } from "@/lib/i18n";
import type { Payload } from "@/lib/crypto";

const REASONS = ["scam", "abuse", "illegal", "other"] as const;
type Reason = (typeof REASONS)[number];
type State = "closed" | "open" | "sending" | "sent" | "error";

/**
 * Lets the receiver choose to send us the secret they just opened. Nothing is sent until they press the button,
 * and no sender, receiver or link details go with it.
 */
export default function ReportPanel({ payload }: { payload: Payload }) {
  const { t } = useT();
  const [state, setState] = useState<State>("closed");
  const [reason, setReason] = useState<Reason>("scam");

  const label: Record<Reason, string> = {
    scam: t.reasonScam,
    abuse: t.reasonAbuse,
    illegal: t.reasonIllegal,
    other: t.reasonOther,
  };

  async function send() {
    setState("sending");
    try {
      const body =
        payload.kind === "text"
          ? { reason, kind: "text", text: payload.text }
          : { reason, kind: "drawing", image: payload.image };
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="mt-5 text-sm text-abhla-dim">
        {t.reportThanks}
      </p>
    );
  }

  if (state === "closed") {
    return (
      <button
        type="button"
        onClick={() => setState("open")}
        className="mt-4 min-h-11 text-sm text-abhla-dim underline underline-offset-4 hover:text-abhla"
      >
        {t.reportCta}
      </button>
    );
  }

  return (
    <fieldset className="mt-5 rounded-[18px] border border-raat-line p-4">
      <legend className="px-1 font-display text-lg font-bold">{t.reportCta}</legend>
      <p className="text-sm text-abhla-dim">{t.reportIntro}</p>
      <p className="mt-3 text-sm font-semibold">{t.reasonLabel}</p>
      <div className="mt-1">
        {REASONS.map((r) => (
          <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name="report-reason"
              checked={reason === r}
              onChange={() => setReason(r)}
              className="size-5 accent-[#f4b83d]"
            />
            {label[r]}
          </label>
        ))}
      </div>
      <button type="button" onClick={send} disabled={state === "sending"} className={`${btnPrimary} mt-3 w-full`}>
        {t.reportSend}
      </button>
      {state === "error" && (
        <p role="alert" className={errorText}>
          {t.errReport}
        </p>
      )}
    </fieldset>
  );
}
