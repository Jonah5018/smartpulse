import type {
  JournalEntry,
} from "./journal-types";

export class JournalEngine {
  static calculateWinRate(
    trades: JournalEntry[]
  ): number {
    if (trades.length === 0) {
      return 0;
    }

    const wins =
      trades.filter(
        trade =>
          trade.result === "win"
      ).length;

    return Math.round(
      (wins / trades.length) * 100
    );
  }
}