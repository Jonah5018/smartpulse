import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getActiveMarketSymbols,
} from "@/lib/market/market-universe";

import {
  ProfileRepository,
} from "@/lib/profiles/profile-repository";

export class WatchlistService {
  /**
   * Return the trader's saved watchlist.
   *
   * Only markets that currently exist in the
   * active SmartPulse market universe are returned.
   */
  static async get(
    client: SupabaseClient,
    authUserId: string
  ): Promise<string[]> {
    const profile =
      await ProfileRepository.findById(
        client,
        authUserId
      );

    if (!profile) {
      throw new Error(
        "Trader profile not found."
      );
    }

    const activeSymbols =
      new Set(
        getActiveMarketSymbols()
      );

    return profile.favorite_markets.filter(
      (symbol) =>
        activeSymbols.has(
          symbol
            .trim()
            .toUpperCase()
        )
    );
  }

  /**
   * Add a market to the trader's watchlist.
   */
  static async add(
    client: SupabaseClient,
    authUserId: string,
    symbol: string
  ): Promise<string[]> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "Market symbol is required."
      );
    }

    const activeSymbols =
      getActiveMarketSymbols();

    if (
      !activeSymbols.includes(
        normalizedSymbol
      )
    ) {
      throw new Error(
        "This market is not available in the SmartPulse market universe."
      );
    }

    const profile =
      await ProfileRepository.findById(
        client,
        authUserId
      );

    if (!profile) {
      throw new Error(
        "Trader profile not found."
      );
    }

    const current =
      profile.favorite_markets ?? [];

    if (
      current.includes(
        normalizedSymbol
      )
    ) {
      return current;
    }

    const updated = [
      ...current,
      normalizedSymbol,
    ];

    const updatedProfile =
      await ProfileRepository.updateOnboarding(
        client,
        authUserId,
        {
          favorite_markets:
            updated,
        }
      );

    return updatedProfile.favorite_markets;
  }

  /**
   * Remove a market from the trader's watchlist.
   */
  static async remove(
    client: SupabaseClient,
    authUserId: string,
    symbol: string
  ): Promise<string[]> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    const profile =
      await ProfileRepository.findById(
        client,
        authUserId
      );

    if (!profile) {
      throw new Error(
        "Trader profile not found."
      );
    }

    const updated =
      (
        profile.favorite_markets ?? []
      ).filter(
        (market) =>
          market !==
          normalizedSymbol
      );

    const updatedProfile =
      await ProfileRepository.updateOnboarding(
        client,
        authUserId,
        {
          favorite_markets:
            updated,
        }
      );

    return updatedProfile.favorite_markets;
  }

  /**
   * Check whether a market is currently
   * on the trader's watchlist.
   */
  static async contains(
    client: SupabaseClient,
    authUserId: string,
    symbol: string
  ): Promise<boolean> {
    const watchlist =
      await this.get(
        client,
        authUserId
      );

    return watchlist.includes(
      symbol.trim().toUpperCase()
    );
  }
}