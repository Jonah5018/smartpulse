import type {
  MultiTimeframeAnalysis,
  TraderAnalysisProfile,
} from "./multi-timeframe-types";

import {
  MultiTimeframeAnalyzer,
} from "./multi-timeframe-analyzer";

export class MultiTimeframeService {
  static async analyze(
    symbol: string,
    profile: TraderAnalysisProfile
  ): Promise<MultiTimeframeAnalysis> {
    return MultiTimeframeAnalyzer.analyze(
      symbol,
      profile
    );
  }
}