import type {
  MarketType,
} from "./market-types";


/**
 * Market analysis priority.
 *
 * Core:
 * Highest-priority markets that receive
 * the deepest SmartPulse analysis.
 *
 * Secondary:
 * Important markets that can be scanned
 * and promoted when conditions are strong.
 *
 * Extended:
 * Broader market coverage that can be
 * analyzed at a lower frequency.
 */
export type MarketTier =
  | "core"
  | "secondary"
  | "extended";


export interface MarketInstrument {
  symbol: string;

  name: string;

  type: MarketType;

  enabled: boolean;

  priority: number;

  tier: MarketTier;
}


/**
 * SmartPulse's supported market universe.
 *
 * `enabled` determines which instruments
 * participate in the current analysis cycle.
 *
 * `priority` determines which instruments
 * should be considered first when provider
 * limits or analysis capacity exist.
 *
 * `tier` determines the depth/frequency of
 * attention the market should eventually receive.
 */
export const MARKET_UNIVERSE:
  MarketInstrument[] = [

  /*
   * ------------------------------------------------
   * FOREX — CORE
   * ------------------------------------------------
   */

  {
    symbol: "GBP/USD",

    name:
      "British Pound / US Dollar",

    type: "forex",

    enabled: true,

    priority: 100,

    tier: "core",
  },

  {
    symbol: "EUR/USD",

    name:
      "Euro / US Dollar",

    type: "forex",

    enabled: true,

    priority: 95,

    tier: "core",
  },

  {
    symbol: "USD/JPY",

    name:
      "US Dollar / Japanese Yen",

    type: "forex",

    enabled: true,

    priority: 90,

    tier: "core",
  },


  /*
   * ------------------------------------------------
   * FOREX — SECONDARY
   * ------------------------------------------------
   */

  {
    symbol: "GBP/JPY",

    name:
      "British Pound / Japanese Yen",

    type: "forex",

    enabled: false,

    priority: 85,

    tier: "secondary",
  },

  {
    symbol: "EUR/JPY",

    name:
      "Euro / Japanese Yen",

    type: "forex",

    enabled: false,

    priority: 80,

    tier: "secondary",
  },

  {
    symbol: "AUD/USD",

    name:
      "Australian Dollar / US Dollar",

    type: "forex",

    enabled: false,

    priority: 75,

    tier: "secondary",
  },

  {
    symbol: "USD/CAD",

    name:
      "US Dollar / Canadian Dollar",

    type: "forex",

    enabled: false,

    priority: 70,

    tier: "secondary",
  },

  {
    symbol: "USD/CHF",

    name:
      "US Dollar / Swiss Franc",

    type: "forex",

    enabled: false,

    priority: 65,

    tier: "secondary",
  },


  /*
   * ------------------------------------------------
   * COMMODITIES — CORE
   * ------------------------------------------------
   */

  {
    symbol: "XAU/USD",

    name:
      "Gold / US Dollar",

    type: "commodity",

    enabled: true,

    priority: 100,

    tier: "core",
  },


  /*
   * ------------------------------------------------
   * COMMODITIES — SECONDARY
   * ------------------------------------------------
   */

  {
    symbol: "XAG/USD",

    name:
      "Silver / US Dollar",

    type: "commodity",

    enabled: false,

    priority: 80,

    tier: "secondary",
  },


  /*
   * ------------------------------------------------
   * CRYPTO — EXTENDED
   * ------------------------------------------------
   */

  {
    symbol: "BTC/USD",

    name:
      "Bitcoin / US Dollar",

    type: "crypto",

    enabled: false,

    priority: 70,

    tier: "extended",
  },

  {
    symbol: "ETH/USD",

    name:
      "Ethereum / US Dollar",

    type: "crypto",

    enabled: false,

    priority: 65,

    tier: "extended",
  },


  /*
   * ------------------------------------------------
   * INDICES — EXTENDED
   * ------------------------------------------------
   *
   * These remain disabled until the exact
   * provider symbol conventions are verified.
   */

  {
    symbol: "SPX",

    name:
      "S&P 500",

    type: "index",

    enabled: false,

    priority: 60,

    tier: "extended",
  },

  {
    symbol: "NDX",

    name:
      "Nasdaq 100",

    type: "index",

    enabled: false,

    priority: 55,

    tier: "extended",
  },
];


/**
 * Return all active instruments.
 *
 * Results are ordered from highest priority
 * to lowest priority.
 */
export function getActiveMarketUniverse():
  MarketInstrument[] {
  return MARKET_UNIVERSE
    .filter(
      (instrument) =>
        instrument.enabled
    )
    .sort(
      (a, b) =>
        b.priority -
        a.priority
    );
}


/**
 * Return active market symbols only.
 */
export function getActiveMarketSymbols():
  string[] {
  return getActiveMarketUniverse()
    .map(
      (instrument) =>
        instrument.symbol
    );
}


/**
 * Return markets belonging to a particular
 * market type.
 *
 * Only enabled markets are returned because
 * this function is intended for active analysis.
 */
export function getMarketsByType(
  type: MarketType
): MarketInstrument[] {
  return MARKET_UNIVERSE
    .filter(
      (instrument) =>
        instrument.type === type &&
        instrument.enabled
    )
    .sort(
      (a, b) =>
        b.priority -
        a.priority
    );
}


/**
 * Return active markets belonging to
 * a particular analysis tier.
 */
export function getMarketsByTier(
  tier: MarketTier
): MarketInstrument[] {
  return MARKET_UNIVERSE
    .filter(
      (instrument) =>
        instrument.tier === tier &&
        instrument.enabled
    )
    .sort(
      (a, b) =>
        b.priority -
        a.priority
    );
}


/**
 * Return all active markets grouped
 * by their analysis tier.
 */
export function getActiveMarketsByTier():
  Record<
    MarketTier,
    MarketInstrument[]
  > {
  return {
    core:
      getMarketsByTier(
        "core"
      ),

    secondary:
      getMarketsByTier(
        "secondary"
      ),

    extended:
      getMarketsByTier(
        "extended"
      ),
  };
}
/** Accept legacy onboarding identifiers such as GBPUSD as well as GBP/USD. */
export function normalizeMarketSymbol(symbol: string): string {
  const normalized = symbol.trim().toUpperCase();
  const compact = normalized.replaceAll("/", "");
  return MARKET_UNIVERSE.find((market) => market.symbol.replaceAll("/", "") === compact)?.symbol ?? normalized;
}

export function normalizeMarketSymbols(symbols: string[]): string[] {
  return [...new Set(symbols.map(normalizeMarketSymbol).filter(Boolean))];
}
