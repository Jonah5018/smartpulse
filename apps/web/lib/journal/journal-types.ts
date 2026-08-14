export type TradeDirection =
  | "buy"
  | "sell";

export type TradeResult =
  | "win"
  | "loss"
  | "breakeven";

export interface JournalEntry {
  id: string;

  traderId: string;

  symbol: string;

  direction: TradeDirection;

  timeframe: string;

  entryPrice: number;

  exitPrice: number;

  stopLoss: number;

  takeProfit: number;

  riskReward: number;

  profitLoss: number;

  result: TradeResult;

  notes: string;

  createdAt: string;
}