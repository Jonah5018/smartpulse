export type ExecutionMode =
  "analysis" | "paper" | "manual" | "semi_auto" | "full_auto";
export type OrderState =
  | "created"
  | "awaiting_approval"
  | "approved"
  | "validating"
  | "submitting"
  | "submitted"
  | "unknown"
  | "partially_filled"
  | "filled"
  | "rejected"
  | "cancelled"
  | "expired"
  | "closing"
  | "closed";
export interface ProtectedOrder {
  symbol: string;
  direction: "buy" | "sell";
  entry: number;
  stop: number;
  target: number;
}
export interface InstrumentSpecification {
  tickSize: number;
  lossTickValue: number;
  minQuantity: number;
  maxQuantity: number;
  quantityStep: number;
  marginPerQuantity: number;
}
export interface RiskLimits {
  riskPercent: number;
  dailyLossPercent: number;
  weeklyLossPercent: number;
  drawdownPercent: number;
  aggregateRiskPercent: number;
  instrumentRiskPercent: number;
  maxPositions: number;
  maxTradesPerDay: number;
  minRewardRisk: number;
  maxSpreadTicks: number;
  maxSlippageTicks: number;
  maxQuantity: number;
  cooldownLosses: number;
}
export const DEFAULT_RISK: RiskLimits = {
  riskPercent: 0.5,
  dailyLossPercent: 2,
  weeklyLossPercent: 5,
  drawdownPercent: 10,
  aggregateRiskPercent: 1,
  instrumentRiskPercent: 0.5,
  maxPositions: 2,
  maxTradesPerDay: 5,
  minRewardRisk: 2,
  maxSpreadTicks: 20,
  maxSlippageTicks: 2,
  maxQuantity: 1e6,
  cooldownLosses: 3,
};
export interface AccountRiskSnapshot {
  equity: number;
  peakEquity: number;
  dailyLoss: number;
  weeklyLoss: number;
  openRisk: number;
  instrumentRisk: number;
  positions: number;
  tradesToday: number;
  freeMargin: number;
  consecutiveLosses: number;
}
