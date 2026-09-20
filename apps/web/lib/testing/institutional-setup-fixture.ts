import type { InstitutionalSetup } from "@/lib/institutional-setup";

export function createSetup(
  overrides: Partial<InstitutionalSetup> = {}
): InstitutionalSetup {
  return {
    symbol: "GBP/USD",
    timeframe: "15min",
    state: "ready",
    direction: "buy",
    quality: "high",
    confidence: 84.4,
    confluence: {
      score: 88,
      grade: "A",
      confirmations: 6,
      breakdown: {
        structure: 20,
        liquidity: 20,
        orderBlock: 12,
        fairValueGap: 14,
        premiumDiscount: 10,
        displacement: 12,
      },
      valid: true,
    },
    executionReadiness: {
      state: "ready",
      score: 90,
      confirmations: [
        "Execution conditions aligned.",
      ],
      missing: [],
      explanation:
        "Execution conditions are aligned.",
    },
    explainability: {
      headline:
        "Bullish institutional setup",
      narrative:
        "Sell-side liquidity was swept before bullish displacement created an execution imbalance.",
      confirmations: [
        "Liquidity sweep confirmed.",
      ],
      warnings: [
        "Respect structural invalidation.",
      ],
    },
    marketStructure: "bullish",
    structureEvent: "mss",
    setupContext: "with_context",
    contextTimeframe: "4h",
    contextTrend: "bullish",
    structureTimeframe: "1h",
    executionTimeframe: "15min",
    multiTimeframeAlignment: "aligned",
    liquiditySweep: "sell_side",
    liquidity: {
      symbol: "GBP/USD",
      timeframe: "15min",
      candleCount: 200,
      buySidePools: [],
      sellSidePools: [],
      equalHighs: [],
      equalLows: [],
      latestSweep: {
        detected: true,
        side: "sell_side",
        direction: "bullish",
        price: 1.271,
        candleIndex: 190,
        sweptPool: null,
      },
      nearestBuySide: null,
      nearestSellSide: null,
      confidence: 85,
      summary:
        "Sell-side liquidity swept.",
    },
    entryZone: {
      low: 1.272,
      high: 1.274,
      midpoint: 1.273,
    },
    invalidation: 1.269,
    targetLiquidity: 1.285,
    riskReward: {
      entry: 1.273,
      stopLoss: 1.269,
      target: 1.285,
      risk: 0.004,
      reward: 0.012,
      ratio: 3,
    },
    displacement: {
      detected: true,
      direction: "bullish",
      strength: 85,
      bodyRatio: 0.8,
      impulseSize: 0.004,
      candleIndex: 191,
    },
    fairValueGap: {
      low: 1.272,
      high: 1.274,
      midpoint: 1.273,
    },
    summary:
      "Bullish setup is ready.",
    explanation:
      "Institutional conditions are aligned.",
    ...overrides,
  };
}

