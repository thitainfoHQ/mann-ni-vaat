// "My secrets": a list kept only in this browser, so a sender can find a link again and see whether it was opened.
// Nothing here is sent to the server. A waiting secret keeps its link (so it can be shared again); once it is opened
// or expired the link is dropped, because it no longer opens anything.
import type { Theme } from "./themes";

export type SentEntry = {
  id: string;
  /** Present only while the secret is still waiting. */
  url?: string;
  at: number;
  kind: "text" | "drawing";
  hasPassphrase: boolean;
  opensAt?: number;
  theme: Theme;
  /** Set once the server no longer has it. */
  done?: "opened" | "expired";
};

const KEY = "mnv-sent";
const MAX_ENTRIES = 30;
const WEEK = 7 * 24 * 60 * 60 * 1000;
const KEEP_FINISHED = 30 * 24 * 60 * 60 * 1000;

export function loadSent(): SentEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as SentEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveSent(list: SentEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {}
}

export function addSent(entry: SentEntry) {
  saveSent([entry, ...loadSent().filter((e) => e.id !== entry.id)]);
}

/** Drops finished entries after 30 days. */
export function prune(list: SentEntry[], now = Date.now()): SentEntry[] {
  return list.filter((e) => !e.done || now - e.at < KEEP_FINISHED);
}

/**
 * What a "not found" answer from the server means. Within 7 days it can only mean it was opened;
 * after that it may simply have expired.
 */
export function finishedAs(entry: SentEntry, now = Date.now()): "opened" | "expired" {
  return now - entry.at < WEEK ? "opened" : "expired";
}

/** Marks an entry finished and forgets its link. */
export function finish(entry: SentEntry, now = Date.now()): SentEntry {
  const { url: _url, ...rest } = entry;
  void _url;
  return { ...rest, done: finishedAs(entry, now) };
}
