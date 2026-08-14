import { MARKET_REGISTRY } from "../registry";
import {
  AssetClass,
  MarketInstrument,
  SubscriptionPlan,
} from "../types";

export class MarketService {
  static getAllMarkets(): MarketInstrument[] {
    return MARKET_REGISTRY;
  }

  static getMarket(symbol: string): MarketInstrument | undefined {
    return MARKET_REGISTRY.find(
      (market) => market.symbol === symbol
    );
  }

  static getMarketsByAssetClass(
    assetClass: AssetClass
  ): MarketInstrument[] {
    return MARKET_REGISTRY.filter(
      (market) => market.assetClass === assetClass
    );
  }

  static getMarketsForPlan(
    plan: SubscriptionPlan
  ): MarketInstrument[] {
    return MARKET_REGISTRY.filter((market) =>
      market.supportedPlans.includes(plan)
    );
  }

  static getHighPriorityMarkets(): MarketInstrument[] {
    return MARKET_REGISTRY
      .filter((market) => market.priority >= 4)
      .sort((a, b) => b.priority - a.priority);
  }

  static searchMarkets(query: string): MarketInstrument[] {
    const search = query.toLowerCase();

    return MARKET_REGISTRY.filter(
      (market) =>
        market.symbol.toLowerCase().includes(search) ||
        market.displayName.toLowerCase().includes(search)
    );
  }
}