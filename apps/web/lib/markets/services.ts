import { MARKET_REGISTRY } from "./registry";
import { AssetClass, MarketInstrument } from "./types";

export class MarketService {
  /**
   * Returns every supported market.
   */
  static getAllMarkets(): MarketInstrument[] {
    return MARKET_REGISTRY;
  }

  /**
   * Returns a market by its symbol.
   */
  static getMarket(
    symbol: string
  ): MarketInstrument | undefined {
    return MARKET_REGISTRY.find(
      (market) => market.symbol === symbol
    );
  }

  /**
   * Returns markets belonging to one or more asset classes.
   */
  static getMarketsByAssetClasses(
    assetClasses: AssetClass[]
  ): MarketInstrument[] {
    if (assetClasses.length === 0) {
      return [];
    }

    return MARKET_REGISTRY.filter((market) =>
      assetClasses.includes(market.assetClass)
    );
  }

  /**
   * Search markets by symbol or display name.
   */
  static searchMarkets(
    query: string,
    assetClasses?: AssetClass[]
  ): MarketInstrument[] {
    const search = query.trim().toLowerCase();

    const markets =
      assetClasses && assetClasses.length > 0
        ? this.getMarketsByAssetClasses(assetClasses)
        : this.getAllMarkets();

    if (!search) {
      return markets;
    }

    return markets.filter(
      (market) =>
        market.symbol.toLowerCase().includes(search) ||
        market.displayName
          .toLowerCase()
          .includes(search)
    );
  }
}
