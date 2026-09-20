import type {
  MarketCandle,
} from "@/lib/market";

interface Entry {
  candles: MarketCandle[];

  expires: number;

}

export class MarketCache {
  private static store =
    new Map<string, Entry>();

  private static key(
    symbol: string,
    timeframe: string,
    outputsize: number
  ) {
    return `${symbol.trim().toUpperCase()}:${timeframe}:${outputsize}`;
  }

  static get(
    symbol: string,
    timeframe: string,
    outputsize = 200
  ): MarketCandle[] | null {
    const item =
      this.store.get(
        this.key(symbol, timeframe, outputsize)
      );

    if (!item) return null;

    if (Date.now() >= item.expires) {
      this.store.delete(this.key(symbol, timeframe, outputsize));
      return null;
    }

    return item.candles;
  }

  static set(
    symbol: string,
    timeframe: string,
    candles: MarketCandle[],
    ttlSeconds = 60,
    outputsize = 200
  ) {
    this.store.set(
      this.key(symbol, timeframe, outputsize),
      {
        candles,
        expires:
          Date.now() +
          ttlSeconds * 1000,
      }
    );
  }

  static clear() {
    this.store.clear();
  }
}
