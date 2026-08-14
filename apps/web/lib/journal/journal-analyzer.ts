import type {
  JournalEntry,
} from "./journal-types";

export class JournalAnalyzer {
  static summarize(
    trades: JournalEntry[]
  ): string {
    return `Total trades: ${trades.length}`;
  }
}