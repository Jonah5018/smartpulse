import {
  regimeService,
} from "@/lib/market-regime";

export class LoadMarketRegime {
  static async execute() {
    return await regimeService.current();
  }
}