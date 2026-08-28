import type { MarketCandle } from "@/lib/market";
import { DealingRangeAnalyzer } from "./dealing-range-analyzer";

export class DealingRangeService {
  static analyze(
    symbol: string,
    candles: MarketCandle[]
  ) {
    return DealingRangeAnalyzer.analyze(
      symbol,
      candles
    );
  }
}