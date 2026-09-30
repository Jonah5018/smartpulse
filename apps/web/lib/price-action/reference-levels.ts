import type {
  AnalysisContext,
  TimeframeAnalysisContext,
} from "@/lib/institutional-setup/analysis-context";
import type { MarketCandle } from "@/lib/market";
import type { MarketStructureAnalysis } from "@/lib/market-structure";

export interface CalendarReferenceLevel {
  period: "previous_day" | "previous_week";
  high: number;
  low: number;
  start: string;
  end: string;
  timezone: "UTC";
}

/** Only complete UTC periods qualify. Gaps/closed sessions are not interpolated. */
export function calendarReferenceLevels(
  context: AnalysisContext,
  now = new Date(),
): CalendarReferenceLevel[] {
  const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekStart = dayStart - ((now.getUTCDay() + 6) % 7) * 86_400_000;
  const periods = [
    { period: "previous_day" as const, start: dayStart - 86_400_000, end: dayStart },
    {
      period: "previous_week" as const,
      start: weekStart - 7 * 86_400_000,
      end: weekStart,
    },
  ];
  const candidates: Array<[TimeframeAnalysisContext | undefined, number]> = [
    [context["1h"], 3_600_000],
    [context["4h"], 14_400_000],
    [context["15min"], 900_000],
  ];

  return periods.flatMap((period) => {
    for (const [source, duration] of candidates) {
      if (!source) continue;
      const candles = source.candles.filter((candle) => {
        const time = Date.parse(candle.timestamp);
        return time >= period.start && time < period.end;
      });
      const expected = (period.end - period.start) / duration;
      const complete =
        candles.length === expected &&
        candles.every(
          (candle, index) =>
            Date.parse(candle.timestamp) === period.start + index * duration,
        );

      if (complete) {
        return [
          {
            period: period.period,
            high: Math.max(...candles.map((candle) => candle.high)),
            low: Math.min(...candles.map((candle) => candle.low)),
            start: new Date(period.start).toISOString(),
            end: new Date(period.end).toISOString(),
            timezone: "UTC" as const,
          },
        ];
      }
    }

    return [];
  });
}

/** A protected pivot must precede a confirmed break of an opposing pivot. */
export function protectedSwing(
  candles: MarketCandle[],
  structure: MarketStructureAnalysis,
  side: "high" | "low",
): number | null {
  const swings = structure.swings ?? [];
  const candidate = [...swings].reverse().find((swing) => swing.type === side);
  if (!candidate) return null;

  const opposing = swings
    .filter((swing) => swing.type !== side && swing.index < candidate.index)
    .at(-1);
  if (!opposing) return null;

  const later = candles.slice(candidate.confirmedIndex + 1);
  const brokenOpposite = later.some((candle) =>
    side === "low" ? candle.close > opposing.price : candle.close < opposing.price,
  );
  const violated = later.some((candle) =>
    side === "low" ? candle.close < candidate.price : candle.close > candidate.price,
  );

  return brokenOpposite && !violated ? candidate.price : null;
}
