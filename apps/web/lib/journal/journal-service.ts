import type {
  JournalEntry,
} from "./journal-types";

import { JournalEngine } from "./journal-engine";

export class JournalService {
  static winRate(
    trades: JournalEntry[]
  ) {
    return JournalEngine.calculateWinRate(
      trades
    );
  }
}