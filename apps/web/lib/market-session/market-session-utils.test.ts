import { describe, expect, it } from "vitest";
import { MarketSessionUtils } from "./market-session-utils";
describe("session time formatting", () => {
  it("keeps the next New York open DST-aware when reusing formatters", () => {
    expect(MarketSessionUtils.nextSessionStart("new_york", new Date("2026-09-16T11:55:00Z"))).toBe("2026-09-16T12:00:00.000Z");
    expect(MarketSessionUtils.nextSessionStart("new_york", new Date("2026-01-14T12:55:00Z"))).toBe("2026-01-14T13:00:00.000Z");
  });
  it("does not confuse Tokyo and London formatters", () => {
    const date = new Date("2026-09-16T06:23:00Z");
    expect(MarketSessionUtils.localHour("tokyo", date)).toBe(15);
    expect(MarketSessionUtils.localHour("london", date)).toBe(7);
    expect(MarketSessionUtils.localMinute("tokyo", date)).toBe(23);
    expect(MarketSessionUtils.localHour("closed", date)).toBeNull();
  });
});
