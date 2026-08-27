// lib/application/macro-context/load-macro-context.ts

import {
  macroContextService,
} from "@/lib/macro";

export class LoadMacroContext {
  static async execute() {
    return await macroContextService.current();
  }
}