import {
  MultiTimeframeEngine,
} from "@/lib/multi-timeframe";

import {
  DealingRangeEngine,
} from "@/lib/dealing-range";

import {
  LiquidityEngine,
} from "@/lib/liquidity";

import {
  InstitutionalAnalysisEngine as MarketStructureEngine,
} from "@/lib/institutional-analysis";

import {
  LiquidityNarrativeService,
} from "@/lib/liquidity-narrative";

import {
  TopDownAnalyzer,
} from "./top-down-analyzer";

export class TopDownService {
  static async current(
    symbol: string
  ) {
    const analysisProfile = "balanced" as unknown as Parameters<
      typeof MultiTimeframeEngine.current
    >[1];

    const [
      mtf,
      range,
      liquidity,
      structure,
    ] = await Promise.all([
      MultiTimeframeEngine.current(
        symbol,
        analysisProfile
      ),

      DealingRangeEngine.current(
        symbol
      ),

      LiquidityEngine.current(
        symbol,
        "15min"
      ),

      MarketStructureEngine.analyze(
        symbol
      ),
    ]);

    const narrative =
      LiquidityNarrativeService.analyze(
        symbol,
        liquidity,
        structure as unknown as Parameters<
          typeof LiquidityNarrativeService.analyze
        >[2]
      );

    return TopDownAnalyzer.analyze(
      symbol,
      mtf,
      range,
      narrative
    );
  }
}