import type {
  TraderAnalysisProfile,
  MultiTimeframeAnalysis,
} from "./multi-timeframe-types";

import {
  MultiTimeframeService,
} from "./multi-timeframe-service";

export class MultiTimeframeEngine {
  static async current(
    symbol: string,
    profile: TraderAnalysisProfile
  ): Promise<MultiTimeframeAnalysis> {
    return MultiTimeframeService.analyze(
      symbol,
      profile
    );
  }
}