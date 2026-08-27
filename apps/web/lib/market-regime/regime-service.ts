// lib/market-regime/regime-service.ts

import {
  macroContextService,
} from "@/lib/macro";

import { RegimeEngine } from "./regime-engine";

export class RegimeService {
  async current() {
    const macro =
      await macroContextService.current();

    return RegimeEngine.analyze(
      macro
    );
  }
}

export const regimeService =
  new RegimeService();