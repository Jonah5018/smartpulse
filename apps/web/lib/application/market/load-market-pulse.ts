import {
  MarketService,
  MockMarketProvider,
} from "@/lib/market";

import type {
  MarketType,
} from "@/lib/market";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  FocusScoreService,
} from "@/lib/focus-score";

import {
  DecisionService,
} from "@/lib/decision";

export class LoadMarketPulse {
  static async execute() {
    const provider =
      new MockMarketProvider();

    const symbols = [
      "GBP/USD",
      "EUR/USD",
      "USD/JPY",
      "XAU/USD",
    ];

    const liveQuotes =
      await MarketRepository.getQuotes(
        symbols
      );

    const quotes =
      liveQuotes.map(
        (quote) => ({
          symbol:
            quote.symbol.replace(
              "/",
              ""
            ),

          name:
            quote.name,

          type:
            (
              quote.symbol ===
              "XAU/USD"
                ? "commodity"
                : "forex"
            ) as MarketType,

          bid:
            quote.bid,

          ask:
            quote.ask,

          spread:
            Number(
              (
                quote.ask -
                quote.bid
              ).toFixed(5)
            ),

          changePercent:
            quote.changePercent,

          timestamp:
            quote.timestamp,
        })
      );

    const pulse =
      MarketService.buildPulse(
        quotes
      );

    const session =
      await provider.getSessionStatus();

    /*
     * Focus Score answers:
     *
     * "Which market deserves attention?"
     */
    const focusScores =
      await Promise.all(
        symbols.map(
          (symbol) =>
            FocusScoreService.current(
              symbol
            )
        )
      );

    focusScores.sort(
      (a, b) =>
        b.score -
        a.score
    );

    /*
     * Decision answers:
     *
     * "What should the trader do with
     * the current institutional setup?"
     *
     * Store decisions by symbol so that
     * ranking order does not matter.
     */
    const decisionEntries =
      await Promise.all(
        symbols.map(
          async (symbol) => {
            const decision =
              await DecisionService.current(
                symbol
              );

            return [
              symbol,
              decision,
            ] as const;
          }
        )
      );

    const decisions =
      Object.fromEntries(
        decisionEntries
      );

    return {
      quotes,

      pulse,

      session,

      focusScores,

      topFocus:
        focusScores[0] ??
        null,

      decisions,
    };
  }
}