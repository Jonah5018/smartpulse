import {
  getActiveMarketUniverse,
} from "@/lib/market/market-universe";

import {
  MarketSessionService,
} from "@/lib/market-session";

import {
  MarketRepository,
} from "@/lib/repositories/market";

import {
  MarketDataError,
} from "@/lib/providers/market-data";

export class LoadMarkets {
  static async execute() {
    const session =
      MarketSessionService.current();

    const universe =
      getActiveMarketUniverse();

    if (
      universe.length === 0
    ) {
      return {
        session,

        markets: [],

        dataStatus: {
          available: false,

          provider:
            "twelve-data",

          status: null,

          retryable: false,

          message:
            "No active markets are currently configured.",
        },
      };
    }

    /*
     * ------------------------------------------------
     * MARKET CLOSED
     * ------------------------------------------------
     */

    if (!session.isOpen) {
      return {
        session,

        markets:
          universe.map(
            (instrument) => ({
              symbol:
                instrument.symbol,

              name:
                instrument.name,

              type:
                instrument.type,

              bid: null,

              ask: null,

              price: null,

              spread: null,

              changePercent: null,

              timestamp: null,

              tier:
                instrument.tier,

              priority:
                instrument.priority,
            })
          ),

        dataStatus: {
          available: false,

          provider:
            "twelve-data",

          status: null,

          retryable: false,

          message:
            "The market is currently closed. Live market quotes will resume when the next trading session opens.",
        },
      };
    }

    /*
     * ------------------------------------------------
     * LIVE MARKET DATA
     * ------------------------------------------------
     */

    const symbols =
      universe.map(
        (market) =>
          market.symbol
      );

    try {
      const quotes =
        await MarketRepository.getQuotes(
          symbols
        );

      const quoteMap =
        new Map(
          quotes.map(
            (quote) => [
              quote.symbol
                .trim()
                .toUpperCase(),

              quote,
            ]
          )
        );

      const markets =
        universe.map(
          (instrument) => {
            const quote =
              quoteMap.get(
                instrument.symbol
                  .trim()
                  .toUpperCase()
              );

            const spread =
              quote?.bid !== null &&
              quote?.bid !== undefined &&
              quote?.ask !== null &&
              quote?.ask !== undefined
                ? Number(
                    (
                      quote.ask -
                      quote.bid
                    ).toFixed(5)
                  )
                : null;

            return {
              symbol:
                instrument.symbol,

              name:
                instrument.name,

              type:
                instrument.type,

              bid:
                quote?.bid ??
                null,

              ask:
                quote?.ask ??
                null,

              price:
                quote?.price ??
                null,

              spread,

              changePercent:
                quote?.changePercent ??
                null,

              timestamp:
                quote?.timestamp ??
                null,

              tier:
                instrument.tier,

              priority:
                instrument.priority,
            };
          }
        );

      return {
        session,

        markets,

        dataStatus: {
          available:
            quotes.length > 0,

          provider:
            "twelve-data",

          status: 200,

          retryable: false,

          message:
            quotes.length > 0
              ? "Live market data is available."
              : "No live market quotes are currently available.",
        },
      };
    } catch (error) {
      if (
        error instanceof
        MarketDataError
      ) {
        return {
          session,

          markets:
            universe.map(
              (instrument) => ({
                symbol:
                  instrument.symbol,

                name:
                  instrument.name,

                type:
                  instrument.type,

                bid: null,

                ask: null,

                price: null,

                spread: null,

                changePercent: null,

                timestamp: null,

                tier:
                  instrument.tier,

                priority:
                  instrument.priority,
              })
            ),

          dataStatus: {
            available: false,

            provider:
              error.provider,

            status:
              error.status,

            retryable:
              error.retryable,

            message:
              error.status === 429
                ? "Live market data is temporarily rate-limited. Please try again shortly."
                : "Live market data is temporarily unavailable.",
          },
        };
      }

      throw error;
    }
  }
}