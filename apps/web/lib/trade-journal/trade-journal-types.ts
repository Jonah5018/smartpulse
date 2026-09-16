import type {
  SetupDirection,
  SetupState,
} from "@/lib/institutional-setup";

export type TradeJournalChecklistId =
  | "higher_timeframe_alignment"
  | "structure_confirmation"
  | "liquidity_event"
  | "directional_displacement"
  | "entry_imbalance"
  | "risk_reward";

export interface TradeJournalChecklistItem {
  id: TradeJournalChecklistId;

  label: string;

  passed: boolean;

  detail: string;
}

export interface TradeJournalRiskPlan {
  entry: number | null;

  stop: number | null;

  target: number | null;

  rr: number | null;
}

export interface AITradeJournal {
  symbol: string;

  timeframe: string;

  direction: SetupDirection;

  state: SetupState;

  confidence: number;

  title: string;

  lesson: string;

  narrative: string;

  riskPlan: TradeJournalRiskPlan;

  checklist: TradeJournalChecklistItem[];

  confirmations: string[];

  warnings: string[];
}
