import type { LiquidityAnalysis } from "@/lib/liquidity";
import type { MarketStructureState } from "@/lib/market-structure";
import { LiquidityNarrativeAnalyzer } from "./liquidity-narrative-analyzer";

export class LiquidityNarrativeService {
  static analyze(
    symbol: string,
    liquidity: LiquidityAnalysis,
    structure: MarketStructureState
  ) {
    return LiquidityNarrativeAnalyzer.analyze(
      symbol,
      liquidity,
      structure
    );
  }
}