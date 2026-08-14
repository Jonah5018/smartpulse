export type AssetClass =
  | "forex"
  | "metal"
  | "index"
  | "commodity"
  | "crypto";

export type MarketCategory =
  | "major"
  | "minor"
  | "exotic"
  | "metal"
  | "index"
  | "commodity"
  | "crypto";

export type TradingSession =
  | "sydney"
  | "tokyo"
  | "london"
  | "new-york";

export type SubscriptionPlan =
  | "trial"
  | "starter"
  | "pro"
  | "elite";

export interface MarketInstrument {
  symbol: string;

  displayName: string;

  assetClass: AssetClass;

  category: MarketCategory;

  baseCurrency?: string;

  quoteCurrency?: string;

  priority: 1 | 2 | 3 | 4 | 5;

  tradingSessions: TradingSession[];

  tradingDays: number[];

  supportedPlans: SubscriptionPlan[];

  /**
   * Whether this market is available during
   * the 5-day free trial.
   */
  trialEnabled: boolean;

  /**
   * Intelligence modules that can analyze
   * this instrument.
   */
  pulseModules: string[];
}