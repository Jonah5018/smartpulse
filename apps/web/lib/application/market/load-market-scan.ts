import {
  MarketScannerService,
} from "@/lib/market-scanner";

export class LoadMarketScan {
  static async execute() {
    return MarketScannerService.current();
  }
}