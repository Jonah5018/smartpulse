import { NextResponse } from "next/server";

import {
  MarketDataService,
} from "@/lib/providers/market-data";

export async function GET() {
  try {
    const quotes =
      await MarketDataService.quotes([
        "GBP/USD",
        "EUR/USD",
        "USD/JPY",
        "XAU/USD",
      ]);

    const candles =
      await MarketDataService.candles(
        "GBP/USD",
        "15min",
        10
      );

    return NextResponse.json({
      success: true,

      quotes: {
        count: quotes.length,
        data: quotes,
      },

      candles: {
        symbol: "GBP/USD",
        interval: "15min",
        count: candles.length,
        data: candles,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}