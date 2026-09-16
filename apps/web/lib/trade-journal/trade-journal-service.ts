import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import {
  TradeJournalEngine,
} from "./trade-journal-engine";

import type {
  AITradeJournal,
} from "./trade-journal-types";

export class TradeJournalService {
  static fromInstitutionalSetup(
    setup: InstitutionalSetup
  ): AITradeJournal {
    return TradeJournalEngine.create(
      setup
    );
  }
}
