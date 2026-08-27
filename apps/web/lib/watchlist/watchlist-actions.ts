"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { WatchlistService } from "./watchlist-service";

export async function toggleWatchlist(
  symbol: string
): Promise<void> {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error(
      "Authentication is required."
    );
  }

  const normalizedSymbol =
    symbol.trim().toUpperCase();

  const isWatched =
    await WatchlistService.contains(
      client,
      user.id,
      normalizedSymbol
    );

  if (isWatched) {
    await WatchlistService.remove(
      client,
      user.id,
      normalizedSymbol
    );
  } else {
    await WatchlistService.add(
      client,
      user.id,
      normalizedSymbol
    );
  }

  revalidatePath("/markets");
}