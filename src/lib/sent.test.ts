import { describe, expect, it } from "vitest";
import { finish, finishedAs, prune, type SentEntry } from "./sent";

const DAY = 24 * 60 * 60 * 1000;
const entry = (at: number, extra: Partial<SentEntry> = {}): SentEntry => ({
  id: "x".repeat(22),
  url: "https://mannivaat.in/m/x#key",
  at,
  kind: "text",
  hasPassphrase: false,
  theme: "classic",
  ...extra,
});

describe("my secrets", () => {
  it("calls a vanished secret 'opened' within 7 days and 'expired' after", () => {
    const now = Date.now();
    expect(finishedAs(entry(now - 2 * DAY), now)).toBe("opened");
    expect(finishedAs(entry(now - 8 * DAY), now)).toBe("expired");
  });

  it("forgets the link once finished", () => {
    const done = finish(entry(Date.now()));
    expect(done.url).toBeUndefined();
    expect(done.done).toBe("opened");
  });

  it("drops finished entries after 30 days but keeps waiting ones", () => {
    const now = Date.now();
    const list = [
      entry(now - 40 * DAY, { id: "old", done: "opened" }),
      entry(now - 5 * DAY, { id: "recent", done: "opened" }),
      entry(now - 1 * DAY, { id: "waiting" }),
    ];
    expect(prune(list, now).map((e) => e.id)).toEqual(["recent", "waiting"]);
  });
});
