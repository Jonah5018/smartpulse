import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TwelveDataProvider } from "./twelve-data-provider";
import type { CandleInterval } from "@/lib/market";

const quote = { symbol: "GBP/USD", close: "1.3", percent_change: "0.2", datetime: "2026-09-28 12:00:00" };
const candle = { datetime: "2026-09-28 12:00:00", open: "1.2", high: "1.4", low: "1.1", close: "1.3" };
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv("TWELVE_DATA_API_KEY", "test-only");
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function respond(data: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(data), { status }));
}

describe("Twelve Data normalization", () => {
  it("parses single quotes with UTC and without manufactured spreads", async () => {
    respond(quote);
    expect(await TwelveDataProvider.quotes(["GBPUSD"])).toEqual([expect.objectContaining({
      symbol: "GBP/USD", price: 1.3, bid: null, ask: null, timestamp: "2026-09-28T12:00:00.000Z",
    })]);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("symbol")).toBe("GBP/USD");
  });

  it("supports batch response shape", async () => {
    respond({ "GBP/USD": quote, "EUR/USD": { ...quote, symbol: "EUR/USD" } });
    expect(await TwelveDataProvider.quotes(["GBP/USD", "EUR/USD"])).toHaveLength(2);
  });

  it.each([{ ...quote, percent_change: "" }, { ...quote, close: "NaN" }, { ...quote, datetime: "bad" }])(
    "rejects malformed quote %#", async data => {
      respond(data);
      await expect(TwelveDataProvider.quotes(["GBPUSD"])).rejects.toThrow();
    }
  );

  it("sorts candles and normalizes UTC", async () => {
    respond({ values: [{ ...candle, datetime: "2026-09-28 12:15:00" }, candle] });
    const candles = await TwelveDataProvider.candles("GBPUSD", "15min");
    expect(candles[0].timestamp).toBe("2026-09-28T12:00:00.000Z");
    expect(candles[0].symbol).toBe("GBP/USD");
  });

  it.each([
    { values: [candle, candle] },
    { values: [{ ...candle, close: "5" }] },
    { values: [{ ...candle, low: "" }] },
    { values: [] },
  ])("rejects malformed or duplicate candles %#", async data => {
    respond(data);
    await expect(TwelveDataProvider.candles("GBPUSD", "15min")).rejects.toThrow();
  });

  it("rejects unsupported inputs before a request", async () => {
    await expect(TwelveDataProvider.candles("USTEC", "15min")).rejects.toThrow("Unsupported");
    await expect(TwelveDataProvider.candles("NOTREAL", "15min")).rejects.toThrow("Unsupported");
    await expect(TwelveDataProvider.candles("GBPUSD", "3min" as CandleInterval)).rejects.toThrow("Unsupported");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves quota status and sanitizes transport errors", async () => {
    respond({ status: "error", code: 429, message: "Credits exhausted" });
    await expect(TwelveDataProvider.candles("GBPUSD", "15min")).rejects.toMatchObject({ status: 429, retryable: true });
    fetchMock.mockRejectedValueOnce(new Error("transport-url-with-secret"));
    await expect(TwelveDataProvider.candles("GBPUSD", "15min")).rejects.toThrow("Unable to load");
  });
});
