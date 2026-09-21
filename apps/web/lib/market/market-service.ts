import type {
  MarketPulse,
  MarketQuote,
} from "./market-types";

import type {
  SessionStatus,
} from "@/lib/market-session";

export class MarketService {
  static buildPulse(
    quotes: Pick<MarketQuote, "changePercent">[],
    session: SessionStatus
  ): MarketPulse {
    /*
     * ------------------------------------------------
     * MARKET CLOSED
     * ------------------------------------------------
     *
     * Do not calculate or present a live pulse when
     * the market is closed.
     *
     * `null` means there is no current score.
     * It is intentionally different from a score of 0.
     */
    if (!session.isOpen) {
      return {
        score: null,

        trend: "neutral",

        volatility: "low",

        confidence: 0,

        summary:
          "Market is currently closed. Live market pulse will resume when the next trading session opens.",

        isLive: false,

        session,
      };
    }

    /*
     * ------------------------------------------------
     * NO LIVE QUOTES
     * ------------------------------------------------
     */

    if (quotes.length === 0) {
      return {
        score: null,

        trend: "neutral",

        volatility: "low",

        confidence: 0,

        summary:
          "Live market data is currently unavailable.",

        isLive: false,

        session,
      };
    }

    /*
     * ------------------------------------------------
     * LIVE MARKET PULSE
     * ------------------------------------------------
     */

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

    const confidence =
      Math.min(
        95,
        Math.max(
          50,
          Math.round(
            70 +
              absoluteAverage *
                20
          )
        )
      );

    const score =
      Math.min(
        100,
        Math.round(
          confidence +
            (trend ===
            "bullish"
              ? 3
              : trend ===
                  "bearish"
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

      isLive: true,

      session,
    };
  }
}