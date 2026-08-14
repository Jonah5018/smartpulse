import type {
  MarketPulse,
  MarketQuote,
} from "./market-types";

export class MarketService {
  static buildPulse(
    quotes: MarketQuote[]
  ): MarketPulse {
    if (quotes.length === 0) {
      return {
        score: 0,
        trend: "neutral",
        volatility: "low",
        confidence: 0,
        summary:
          "No market data available.",
      };
    }

    const averageChange =
      quotes.reduce(
        (sum, quote) =>
          sum + quote.changePercent,
        0
      ) / quotes.length;

    const trend =
      averageChange > 0.15
        ? "bullish"
        : averageChange < -0.15
        ? "bearish"
        : "neutral";

    const absoluteAverage =
      Math.abs(averageChange);

    const volatility =
      absoluteAverage > 1
        ? "extreme"
        : absoluteAverage > 0.5
        ? "high"
        : absoluteAverage > 0.15
        ? "normal"
        : "low";

    const confidence = Math.min(
      95,
      Math.max(
        50,
        Math.round(
          70 + absoluteAverage * 20
        )
      )
    );

    const score = Math.min(
      100,
      Math.round(
        confidence +
          (trend === "bullish"
            ? 3
            : trend === "bearish"
            ? 2
            : 0)
      )
    );

    const summary =
      trend === "bullish"
        ? "Bullish momentum is strengthening across monitored markets."
        : trend === "bearish"
        ? "Bearish pressure is increasing across monitored markets."
        : "Market conditions are currently balanced.";

    return {
      score,
      trend,
      volatility,
      confidence,
      summary,
    };
  }
}