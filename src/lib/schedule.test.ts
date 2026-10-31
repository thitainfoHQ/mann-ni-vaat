import { describe, expect, it } from "vitest";
import { fill, formatCountdown, toLocalInput } from "./schedule";

describe("schedule helpers", () => {
  it("formats a countdown", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(61_000)).toBe("00:01:01");
    expect(formatCountdown(26 * 3600 * 1000 + 3 * 60_000 + 4_000)).toBe("1d 02:03:04");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });

  it("fills placeholders and leaves unknown ones empty", () => {
    expect(fill("It opens on {time}.", { time: "9 pm" })).toBe("It opens on 9 pm.");
    expect(fill("{a}{b}", { a: "x" })).toBe("x");
  });

  it("round-trips a time through the datetime-local format in local time", () => {
    const ms = new Date(2026, 10, 8, 0, 0).getTime();
    expect(toLocalInput(ms)).toBe("2026-11-08T00:00");
    expect(new Date(toLocalInput(ms)).getTime()).toBe(ms);
  });
});
