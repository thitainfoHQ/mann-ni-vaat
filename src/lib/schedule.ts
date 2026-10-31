// Scheduled reveal helpers shared by the sender, the receiver and the server.
// A scheduled secret still expires 7 days after creation, so it can be scheduled at most 4 days ahead.
export const MAX_SCHEDULE_MS = 4 * 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

/** 93784000 -> "1d 02:03:04" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${d > 0 ? `${d}d ` : ""}${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** A date and time in the reader's language, falling back to the browser default for languages Intl lacks. */
export function formatTime(ms: number, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(ms);
  } catch {
    return new Date(ms).toLocaleString();
  }
}

/** The value a <input type="datetime-local"> expects, in the user's own time zone. */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Fills {name} placeholders in a translated string. */
export const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
