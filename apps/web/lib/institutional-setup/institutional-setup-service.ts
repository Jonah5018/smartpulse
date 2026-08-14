import type {
  CandleInterval,
} from "@/lib/market";

import type {
  InstitutionalSetup,
} from "./institutional-setup-types";

import {
  InstitutionalSetupEngine,
} from "./institutional-setup-engine";

export class InstitutionalSetupService {
  static async current(
    symbol: string,
    timeframe: CandleInterval = "15min",
    outputsize: number = 200
  ): Promise<InstitutionalSetup> {
    return InstitutionalSetupEngine.current(
      symbol,
      timeframe,
      outputsize
    );
  }
}