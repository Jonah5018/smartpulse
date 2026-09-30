import {
  getActiveMarketUniverse,
  normalizeMarketSymbols,
} from "@/lib/market/market-universe";
import { MarketAvailabilityService } from "@/lib/market-session/market-availability-service";

/** Stable within a minute, rotating between minutes without a background job. */
export function scheduledScanSymbols(date = new Date(), limit = 4): string[] {
  const universe = getActiveMarketUniverse().filter(
    (instrument) => MarketAvailabilityService.current(instrument.id, date).isOpen,
  );

  if (universe.length <= limit) return universe.map((instrument) => instrument.symbol);

  const start = Math.floor(date.getTime() / 60_000) % universe.length;

  return Array.from(
    { length: limit },
    (_, offset) => universe[(start + offset) % universe.length].symbol,
  );
}

/** Deep analysis is bounded independently from registry size. */
export function discoverySymbols(
  requested: string,
  watchlist: string[],
  limit = 1,
): string[] {
  return normalizeMarketSymbols([...watchlist, ...scheduledScanSymbols()])
    .filter(
      (symbol) =>
        symbol !== requested && MarketAvailabilityService.current(symbol).isOpen,
    )
    .slice(0, limit);
}
