import { MarketRepository } from "@/lib/repositories/market/market-repository";
import { DealingRangeService } from "./dealing-range-service";

export class DealingRangeEngine {
  static async current(symbol: string) {
    const candles =
      await MarketRepository.getCandles(
        symbol,
        "1h",
        200
      );

    return DealingRangeService.analyze(
      symbol,
      candles
    );
  }
}