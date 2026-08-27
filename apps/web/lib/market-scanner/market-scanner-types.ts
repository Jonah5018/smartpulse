import type {
  MarketTier,
} from "@/lib/market/market-universe";

import type {
  MarketType,
} from "@/lib/market";


export type MarketScanStatus =
  | "candidate"
  | "watch"
  | "priority"
  | "excluded";


export interface MarketScanInput {
  symbol: string;

  name: string;

  type: MarketType;

  tier: MarketTier;

  priority: number;

  changePercent: number;
}


export interface MarketScanResult {
  symbol: string;

  name: string;

  type: MarketType;

  tier: MarketTier;

  priority: number;

  status: MarketScanStatus;

  score: number;

  changePercent: number;

  reason: string;
}