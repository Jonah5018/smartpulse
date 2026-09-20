import { afterEach, describe, expect, it, vi } from "vitest";
import { TwelveDataProvider } from "./twelve-data-provider";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("TwelveDataProvider errors", () => {
  it("returns a typed error when the API key is missing", async () => {
    vi.stubEnv("TWELVE_DATA_API_KEY", "");
    await expect(TwelveDataProvider.candles("GBP/USD", "15min")).rejects.toMatchObject({
      name: "MarketDataError", provider: "twelve-data", retryable: false,
    });
  });

  it("normalizes network failures without exposing request credentials", async () => {
    vi.stubEnv("TWELVE_DATA_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Fetch failed with apikey=test-key")));
    await expect(TwelveDataProvider.candles("GBP/USD", "15min")).rejects.toMatchObject({
      name: "MarketDataError", provider: "twelve-data", retryable: true,
      message: "Unable to load 15min candle data for GBP/USD.",
    });
  });
});
