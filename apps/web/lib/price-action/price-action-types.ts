import type { CalendarReferenceLevel } from "./reference-levels";
import type { MarketStructureAnalysis } from "@/lib/market-structure";
import type { FairValueGap } from "@/lib/imbalance";

export type PriceActionState =
  | "observation"
  | "potential_setup"
  | "developing_setup"
  | "confirmed_setup"
  | "invalid_setup"
  | "no_trade"
  | "insufficient_data";

export interface PriceActionZone {
  kind: "support" | "resistance" | "supply" | "demand";
  low: number;
  high: number;
  timeframe: string;
  formedAt: string;
  retests: number;
  status: "fresh" | "tested" | "mitigated";
  roleReversal: boolean;
  evidence: string[];
}

export interface CandleContext {
  patterns: string[];
  phase: "compression" | "expansion" | "balanced";
  directionalRejection: "bullish" | "bearish" | null;
  rangeRatio: number | null;
}

export interface BreakoutAssessment {
  state: "none" | "potential" | "unconfirmed" | "confirmed" | "false_breakout" | "retest";
  direction: "bullish" | "bearish" | null;
  level: number | null;
  explanation: string;
}

export interface PriceActionAnalysis {
  state: PriceActionState;
  setupType: string;
  direction: "bullish" | "bearish" | "neutral";
  internal: MarketStructureAnalysis;
  external: MarketStructureAnalysis;
  protectedHigh: number | null;
  protectedLow: number | null;
  weakHigh: number | null;
  weakLow: number | null;
  zones: PriceActionZone[];
  candleContext: CandleContext;
  breakout: BreakoutAssessment;
  gaps: FairValueGap[];
  higherTimeframeGaps: FairValueGap[];
  calendarLevels: CalendarReferenceLevel[];
  location: "premium" | "discount" | "equilibrium" | "unavailable";
  target: number | null;
  invalidation: number | null;
  conflicts: string[];
  missing: string[];
  evidence: string[];
  waitFor: string;
  narrative: string;
  beginnerNarrative: string;
}
