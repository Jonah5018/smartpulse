import type { CandleInterval, MarketCandle } from "@/lib/market";
import { MarketRepository } from "@/lib/repositories/market";
import { MarketStructureAnalyzer } from "@/lib/market-structure/market-structure-analyzer";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import { MarketDataError } from "@/lib/providers/market-data";

export interface TimeframeAnalysisContext {
  candles: MarketCandle[];
  structure: MarketStructureAnalysis;
  external: MarketStructureAnalysis;
}

export type AnalysisContext = Partial<Record<CandleInterval, TimeframeAnalysisContext>>;

const intervalMinutes: Record<CandleInterval, number> = {
  "1min": 1,
  "5min": 5,
  "15min": 15,
  "30min": 30,
  "1h": 60,
  "2h": 120,
  "4h": 240,
  "8h": 480,
  "1day": 1440,
};

export async function loadAnalysisContext(
  symbol: string,
  timeframes: CandleInterval[],
  outputsize: number,
): Promise<AnalysisContext> {
  const entries = await Promise.all(
    [...new Set(timeframes)].map(async (timeframe) => {
      const received = await MarketRepository.getCandles(symbol, timeframe, outputsize);
      const duration = intervalMinutes[timeframe] * 60_000;
      const now = Date.now();
      // In-progress bars cannot confirm structural breaks or backtested pivots.
      const candles = received.filter(
        (candle) => Date.parse(candle.timestamp) + duration <= now,
      );

      if (candles.length < 20) {
        throw new MarketDataError("Insufficient candle history for " + timeframe + ".", {
          retryable: false,
        });
      }

      if (now - Date.parse(candles.at(-1)!.timestamp) > duration * 3) {
        throw new MarketDataError("Stale candle history for " + timeframe + ".", {
          retryable: true,
        });
      }

      return [
        timeframe,
        {
          candles,
          structure: MarketStructureAnalyzer.analyzeCandles(candles, timeframe, 2),
          external: MarketStructureAnalyzer.analyzeCandles(candles, timeframe, 5),
        },
      ] as const;
    }),
  );

  return Object.fromEntries(entries);
}
