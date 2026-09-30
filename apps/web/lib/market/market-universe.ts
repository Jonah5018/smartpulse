import type { MarketType } from "./market-types";

export type MarketTier = "core" | "secondary" | "extended";
export type InstrumentAssetClass = "forex" | "metal" | "crypto" | "index";
export type MarketDataProviderId = "twelveData";

export interface MarketInstrument {
  id: string;
  symbol: string;
  name: string;
  assetClass: InstrumentAssetClass;
  type: MarketType;
  category: "major" | "cross" | "gold" | "silver" | "us" | "europe" | "asia";
  baseAsset?: string;
  quoteAsset?: string;
  enabled: boolean;
  priority: number;
  tier: MarketTier;
  aliases: readonly string[];
  providerSymbols: Partial<Record<MarketDataProviderId, string>>;
  unavailableReason?: string;
}

// The sole instrument configuration. Display symbols remain compatible with
// existing profile preferences, Journal records and public analysis outputs.
export const MARKET_UNIVERSE: readonly MarketInstrument[] = [
  {
    id: "GBPUSD",
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "GBP",
    quoteAsset: "USD",
    enabled: true,
    priority: 100,
    tier: "core",
    aliases: [],
    providerSymbols: { twelveData: "GBP/USD" },
  },

  {
    id: "EURUSD",
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "EUR",
    quoteAsset: "USD",
    enabled: true,
    priority: 95,
    tier: "core",
    aliases: [],
    providerSymbols: { twelveData: "EUR/USD" },
  },

  {
    id: "USDJPY",
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "USD",
    quoteAsset: "JPY",
    enabled: true,
    priority: 90,
    tier: "core",
    aliases: [],
    providerSymbols: { twelveData: "USD/JPY" },
  },

  {
    id: "USDCHF",
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "USD",
    quoteAsset: "CHF",
    enabled: true,
    priority: 65,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "USD/CHF" },
  },

  {
    id: "USDCAD",
    symbol: "USD/CAD",
    name: "US Dollar / Canadian Dollar",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "USD",
    quoteAsset: "CAD",
    enabled: true,
    priority: 70,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "USD/CAD" },
  },

  {
    id: "AUDUSD",
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "AUD",
    quoteAsset: "USD",
    enabled: true,
    priority: 75,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "AUD/USD" },
  },

  {
    id: "NZDUSD",
    symbol: "NZD/USD",
    name: "New Zealand Dollar / US Dollar",
    assetClass: "forex",
    type: "forex",
    category: "major",
    baseAsset: "NZD",
    quoteAsset: "USD",
    enabled: true,
    priority: 65,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "NZD/USD" },
  },

  {
    id: "GBPJPY",
    symbol: "GBP/JPY",
    name: "British Pound / Japanese Yen",
    assetClass: "forex",
    type: "forex",
    category: "cross",
    baseAsset: "GBP",
    quoteAsset: "JPY",
    enabled: true,
    priority: 85,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "GBP/JPY" },
  },

  {
    id: "EURJPY",
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
    assetClass: "forex",
    type: "forex",
    category: "cross",
    baseAsset: "EUR",
    quoteAsset: "JPY",
    enabled: true,
    priority: 80,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "EUR/JPY" },
  },

  {
    id: "EURGBP",
    symbol: "EUR/GBP",
    name: "Euro / British Pound",
    assetClass: "forex",
    type: "forex",
    category: "cross",
    baseAsset: "EUR",
    quoteAsset: "GBP",
    enabled: true,
    priority: 75,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "EUR/GBP" },
  },

  {
    id: "AUDJPY",
    symbol: "AUD/JPY",
    name: "Australian Dollar / Japanese Yen",
    assetClass: "forex",
    type: "forex",
    category: "cross",
    baseAsset: "AUD",
    quoteAsset: "JPY",
    enabled: true,
    priority: 70,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "AUD/JPY" },
  },

  {
    id: "XAUUSD",
    symbol: "XAU/USD",
    name: "Gold / US Dollar",
    assetClass: "metal",
    type: "commodity",
    category: "gold",
    baseAsset: "XAU",
    quoteAsset: "USD",
    enabled: true,
    priority: 100,
    tier: "core",
    aliases: [],
    providerSymbols: { twelveData: "XAU/USD" },
  },

  {
    id: "XAGUSD",
    symbol: "XAG/USD",
    name: "Silver / US Dollar",
    assetClass: "metal",
    type: "commodity",
    category: "silver",
    baseAsset: "XAG",
    quoteAsset: "USD",
    enabled: true,
    priority: 80,
    tier: "secondary",
    aliases: [],
    providerSymbols: { twelveData: "XAG/USD" },
  },

  {
    id: "BTCUSD",
    symbol: "BTC/USD",
    name: "Bitcoin / US Dollar",
    assetClass: "crypto",
    type: "crypto",
    category: "major",
    baseAsset: "BTC",
    quoteAsset: "USD",
    enabled: true,
    priority: 70,
    tier: "extended",
    aliases: [],
    providerSymbols: { twelveData: "BTC/USD" },
  },

  {
    id: "ETHUSD",
    symbol: "ETH/USD",
    name: "Ethereum / US Dollar",
    assetClass: "crypto",
    type: "crypto",
    category: "major",
    baseAsset: "ETH",
    quoteAsset: "USD",
    enabled: true,
    priority: 65,
    tier: "extended",
    aliases: [],
    providerSymbols: { twelveData: "ETH/USD" },
  },

  {
    id: "NAS100",
    symbol: "NDX",
    name: "Nasdaq 100",
    assetClass: "index",
    type: "index",
    category: "us",
    quoteAsset: "USD",
    enabled: false,
    priority: 55,
    tier: "extended",
    aliases: ["NASDAQ100", "USTEC", "US100"],
    providerSymbols: {},
    unavailableReason: "Provider mapping and exchange calendar are not verified.",
  },

  {
    id: "SP500",
    symbol: "SPX",
    name: "S&P 500",
    assetClass: "index",
    type: "index",
    category: "us",
    quoteAsset: "USD",
    enabled: false,
    priority: 55,
    tier: "extended",
    aliases: ["SPX500", "US500"],
    providerSymbols: {},
    unavailableReason: "Provider mapping and exchange calendar are not verified.",
  },

  {
    id: "US30",
    symbol: "US30",
    name: "Dow Jones 30",
    assetClass: "index",
    type: "index",
    category: "us",
    quoteAsset: "USD",
    enabled: false,
    priority: 55,
    tier: "extended",
    aliases: ["DJI", "DJ30", "DOW30"],
    providerSymbols: {},
    unavailableReason: "Provider mapping and exchange calendar are not verified.",
  },
];

const aliasKey = (value: string) => value.trim().toUpperCase().replaceAll("/", "");
const instrumentsByAlias = new Map<string, MarketInstrument>();

for (const instrument of MARKET_UNIVERSE) {
  for (const alias of [instrument.id, instrument.symbol, ...instrument.aliases]) {
    const key = aliasKey(alias);
    const existing = instrumentsByAlias.get(key);

    if (existing && existing.id !== instrument.id) {
      throw new Error("Ambiguous instrument alias: " + alias);
    }

    instrumentsByAlias.set(key, instrument);
  }
}

export function findInstrument(value: string): MarketInstrument | undefined {
  return instrumentsByAlias.get(aliasKey(value));
}

export function requireInstrument(value: string): MarketInstrument {
  const instrument = findInstrument(value);

  if (!instrument) {
    throw new Error("Unsupported instrument.");
  }

  return instrument;
}

export function canonicalInstrumentId(value: string): string {
  return requireInstrument(value).id;
}

export function getProviderSymbol(
  value: string,
  provider: MarketDataProviderId,
): string | null {
  return requireInstrument(value).providerSymbols[provider] ?? null;
}

export function getActiveMarketUniverse(): MarketInstrument[] {
  return MARKET_UNIVERSE.filter((instrument) => instrument.enabled).sort(
    (left, right) => right.priority - left.priority,
  );
}

export function getActiveMarketSymbols(): string[] {
  return getActiveMarketUniverse().map((instrument) => instrument.symbol);
}

export function getMarketsByType(type: MarketType): MarketInstrument[] {
  return getActiveMarketUniverse().filter((instrument) => instrument.type === type);
}

export function getMarketsByTier(tier: MarketTier): MarketInstrument[] {
  return getActiveMarketUniverse().filter((instrument) => instrument.tier === tier);
}

export function getActiveMarketsByTier(): Record<MarketTier, MarketInstrument[]> {
  return {
    core: getMarketsByTier("core"),
    secondary: getMarketsByTier("secondary"),
    extended: getMarketsByTier("extended"),
  };
}

export function getActiveMarketGroups(): Record<string, MarketInstrument[]> {
  const groups: Record<string, MarketInstrument[]> = {};

  for (const instrument of getActiveMarketUniverse()) {
    const key = instrument.assetClass + " · " + instrument.category;
    (groups[key] ??= []).push(instrument);
  }

  return groups;
}

// Compatibility for stored preferences only. Provider and analysis boundaries
// must call requireInstrument/findInstrument rather than trusting this helper.
export function normalizeMarketSymbol(symbol: string): string {
  return findInstrument(symbol)?.symbol ?? symbol.trim().toUpperCase();
}

export function normalizeMarketSymbols(symbols: string[]): string[] {
  return [...new Set(symbols.map(normalizeMarketSymbol).filter(Boolean))];
}
