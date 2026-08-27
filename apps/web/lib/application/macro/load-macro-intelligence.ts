import {
  macroService,
} from "@/lib/macro";

export class LoadMacroIntelligence {
  static async execute() {
    const analysis =
      await macroService.getTodayAnalysis();
    return analysis;
  }
}