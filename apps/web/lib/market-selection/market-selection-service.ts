import {
  getActiveMarketUniverse,
} from "@/lib/market/market-universe";


import {
  OpportunityDiscoveryService,
} from "@/lib/opportunity-discovery";


import type {
  Opportunity,
} from "@/lib/opportunity";


import type {
  OpportunityCandidate,
} from "@/lib/opportunity-discovery";


export interface MarketSelection {
  /**
   * Market SmartPulse currently considers
   * the primary market to focus on.
   */
  primarySymbol: string;


  /**
   * Markets explicitly selected by the trader.
   */
  watchedSymbols: string[];


  /**
   * Active markets outside the trader's
   * watchlist that remain eligible for discovery.
   */
  discoverySymbols: string[];


  /**
   * Highest-ranked opportunity across both
   * watchlist and discovery markets.
   */
  bestOpportunity:
    | OpportunityCandidate
    | null;


  /**
   * Highest-ranked opportunity from the
   * trader's watchlist.
   */
  bestWatchedOpportunity:
    | OpportunityCandidate
    | null;


  /**
   * Highest-ranked opportunity outside the
   * watchlist that actually meets the
   * SmartPulse discovery threshold.
   */
  bestDiscoveryOpportunity:
    | OpportunityCandidate
    | null;
}


export class MarketSelectionService {
  /**
   * Select and rank markets for SmartPulse.
   *
   * Watchlisted markets receive priority
   * attention, but every active market remains
   * eligible for opportunity discovery.
   *
   * No market-data request is performed here.
   *
   * Opportunities are supplied by the caller.
   */
  static select(
    watchlist: string[],

    opportunities: Record<
      string,
      Opportunity
    >
  ): MarketSelection {
    const universe =
      getActiveMarketUniverse();


    const activeSymbols =
      universe.map(
        (market) =>
          market.symbol
      );


    const activeSymbolSet =
      new Set(
        activeSymbols
      );


    /*
     * Normalize and validate the trader's
     * watchlist against the active universe.
     */
    const watchedSymbols =
      [
        ...new Set(
          watchlist
            .map(
              (symbol) =>
                symbol
                  .trim()
                  .toUpperCase()
            )
            .filter(
              (symbol) =>
                activeSymbolSet.has(
                  symbol
                )
            )
        ),
      ];


    /*
     * Every active market outside the
     * watchlist remains eligible for
     * SmartPulse Discovery.
     */
    const discoverySymbols =
      activeSymbols.filter(
        (symbol) =>
          !watchedSymbols.includes(
            symbol
          )
      );


    const discovery =
      OpportunityDiscoveryService.rank(
        opportunities,

        watchedSymbols,

        discoverySymbols
      );


    /*
     * Primary market logic:
     *
     * 1. Highest-ranked opportunity overall
     * 2. First watched market
     * 3. First discovery market
     * 4. Empty string as final safety fallback
     */
    const primarySymbol =
      discovery.best?.opportunity
        .symbol ??
      watchedSymbols[0] ??
      discoverySymbols[0] ??
      "";


    return {
      primarySymbol,

      watchedSymbols,

      discoverySymbols,

      bestOpportunity:
        discovery.best,

      bestWatchedOpportunity:
        discovery.bestWatched,

      bestDiscoveryOpportunity:
        discovery.bestDiscovery,
    };
  }
}