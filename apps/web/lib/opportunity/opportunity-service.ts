import {
  OpportunityEngine,
} from "./opportunity-engine";

import type {
  Opportunity,
} from "./opportunity-types";

import type {
  TraderAnalysisProfile,
} from "@/lib/multi-timeframe";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

export class OpportunityService {
  private static cache =
    new Map<
      string,
      {
        data: Opportunity;
        expiresAt: number;
      }
    >();

  private static inFlight =
    new Map<
      string,
      Promise<Opportunity>
    >();

  private static readonly CACHE_DURATION =
    30 * 1000;

  static async current(
    symbol: string,
    profile?: TraderAnalysisProfile
  ): Promise<Opportunity> {
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
      OpportunityEngine.current(
        normalizedSymbol,
        profile
      )
        .then((opportunity) => {
          this.cache.set(
            cacheKey,
            {
              data: opportunity,
              expiresAt:
                Date.now() +
                this.CACHE_DURATION,
            }
          );

          return opportunity;
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
   * Build an Opportunity directly from
   * an already calculated Institutional Setup.
   *
   * This avoids running the institutional
   * analysis again.
   */
  static fromInstitutionalSetup(
    setup: InstitutionalSetup
  ): Opportunity {
    return OpportunityEngine.fromInstitutionalSetup(
      setup
    );
  }

  private static buildCacheKey(
    symbol: string,
    profile?: TraderAnalysisProfile
  ): string {
    const profileKey =
      profile
        ? [
            profile.tradingStyle,
            profile.timeframes.context,
            profile.timeframes.structure,
            profile.timeframes.execution,
          ].join("|")
        : "default";

    return [
      symbol,
      profileKey,
    ].join("::");
  }

  static clearCache(): void {
    this.cache.clear();
    this.inFlight.clear();
  }
}