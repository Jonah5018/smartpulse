import type {
  CandleInterval,
} from "@/lib/market";

import type {
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

import type {
  InstitutionalSetup,
} from "./institutional-setup-types";

import {
  InstitutionalSetupEngine,
} from "./institutional-setup-engine";

export class InstitutionalSetupService {
  private static cache =
    new Map<
      string,
      {
        data: InstitutionalSetup;
        expiresAt: number;
      }
    >();

  private static inFlight =
    new Map<
      string,
      Promise<InstitutionalSetup>
    >();

  private static readonly CACHE_DURATION =
    30 * 1000;

  /**
   * Get the current institutional setup.
   *
   * Results are cached briefly to prevent
   * repeated dashboard consumers from
   * recalculating the same setup.
   *
   * Concurrent identical requests share
   * the same in-flight Promise.
   */
  static async current(
    symbol: string,
    timeframe?: CandleInterval,
    outputsize: number = 200,
    profile?: TraderAnalysisProfile
  ): Promise<InstitutionalSetup> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "Market symbol is required."
      );
    }

    const cacheKey =
      this.buildCacheKey(
        normalizedSymbol,
        timeframe,
        outputsize,
        profile
      );

    const now = Date.now();

    const cached =
      this.cache.get(cacheKey);

    if (
      cached &&
      now < cached.expiresAt
    ) {
      return cached.data;
    }

    const existing =
      this.inFlight.get(cacheKey);

    if (existing) {
      return existing;
    }

    const request =
      InstitutionalSetupEngine.current(
        normalizedSymbol,
        timeframe,
        outputsize,
        profile
      )
        .then((setup) => {
          this.cache.set(
            cacheKey,
            {
              data: setup,
              expiresAt:
                Date.now() +
                this.CACHE_DURATION,
            }
          );

          return setup;
        })
        .finally(() => {
          this.inFlight.delete(
            cacheKey
          );
        });

    this.inFlight.set(
      cacheKey,
      request
    );

    return request;
  }

  /**
   * Build a cache key from every input
   * that can materially change the setup.
   *
   * The trader profile is included so that
   * different multi-timeframe configurations
   * never share the wrong institutional setup.
   */
  private static buildCacheKey(
    symbol: string,
    timeframe?: CandleInterval,
    outputsize: number = 200,
    profile?: TraderAnalysisProfile
  ): string {
    const profileKey =
      profile
        ? [
            profile.timeframes.context,
            profile.timeframes.structure,
            profile.timeframes.execution,
          ].join("|")
        : "default";

    return [
      symbol,
      timeframe ?? "none",
      outputsize,
      profileKey,
    ].join("::");
  }

  /**
   * Clear all cached institutional setups
   * and pending requests.
   */
  static clearCache(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}