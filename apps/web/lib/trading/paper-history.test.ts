import { describe, expect, it } from "vitest";
import type { MarketCandle } from "@/lib/market";
import { paperHistoryWindow } from "./paper-history";

const start = Date.parse("2026-10-01T00:00:00Z");
const interval = 900_000;
const candle = (offset: number) =>
  ({
    timestamp: new Date(start + offset * interval).toISOString(),
    open: 100,
    high: 110,
    low: 90,
    close: 105,
  }) as MarketCandle;

describe("paper monitoring history", () => {
  it("excludes pre-entry extremes and the current unfinished candle", () => {
    expect(
      paperHistoryWindow(
        [candle(0), candle(1), candle(2)],
        start + 1,
        start + 2.5 * interval,
        () => false,
      ),
    ).toEqual([candle(1)]);
  });
  it("rejects missing internal and trailing open-market intervals", () => {
    expect(() =>
      paperHistoryWindow(
        [candle(0), candle(2)],
        start,
        start + 3 * interval,
        () => false,
      ),
    ).toThrow("incomplete");
    expect(() =>
      paperHistoryWindow([candle(0)], start, start + 2 * interval, () => false),
    ).toThrow("incomplete");
  });
  it("permits only explicitly closed intervals to be absent", () => {
    expect(
      paperHistoryWindow(
        [candle(0), candle(2)],
        start,
        start + 3 * interval,
        (time) => time === start + interval,
      ),
    ).toEqual([candle(0), candle(2)]);
  });
  it("rejects invalid OHLC and duplicate timestamps instead of skipping them", () => {
    expect(() =>
      paperHistoryWindow(
        [{ ...candle(0), high: 80 }],
        start,
        start + interval,
        () => false,
      ),
    ).toThrow("Invalid");
    expect(() =>
      paperHistoryWindow(
        [candle(0), candle(0)],
        start,
        start + interval,
        () => false,
      ),
    ).toThrow("duplicate");
  });
  it("orders provider candles chronologically", () => {
    expect(
      paperHistoryWindow(
        [candle(1), candle(0)],
        start,
        start + 2 * interval,
        () => false,
      ),
    ).toEqual([candle(0), candle(1)]);
  });
  it("bounds recovery work and rejects invalid checkpoints", () => {
    expect(() => paperHistoryWindow([], NaN, start, () => true)).toThrow(
      "checkpoint",
    );
    expect(() =>
      paperHistoryWindow([], start, start + 15 * 86_400_000, () => true),
    ).toThrow("checkpoint");
  });
});
