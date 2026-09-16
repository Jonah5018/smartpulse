import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import {
  TradeJournalEngine,
} from "./trade-journal-engine";

function createSetup(
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

describe(
  "TradeJournalEngine",
  () => {
    it(
      "creates a ready journal from real setup evidence",
      () => {
        const journal =
          TradeJournalEngine.create(
            createSetup()
          );

        expect(journal).toMatchObject({
          symbol: "GBP/USD",
          timeframe: "15min",
          direction: "buy",
          state: "ready",
          confidence: 84,
          title:
            "BUY execution plan is ready",
          riskPlan: {
            entry: 1.273,
            stop: 1.269,
            target: 1.285,
            rr: 3,
          },
        });

        expect(
          journal.checklist
        ).toHaveLength(6);

        expect(
          journal.checklist.every(
            (item) => item.passed
          )
        ).toBe(true);

        expect(journal.narrative).toContain(
          "Sell-side liquidity"
        );
      }
    );

    it(
      "does not invent a risk plan for a forming setup",
      () => {
        const journal =
          TradeJournalEngine.create(
            createSetup({
              state: "forming",
              riskReward: null,
              entryZone: null,
              fairValueGap: null,
              multiTimeframeAlignment:
                "partially_aligned",
            })
          );

        expect(journal.title).toBe(
          "BUY thesis is still forming"
        );

        expect(journal.riskPlan).toEqual({
          entry: null,
          stop: null,
          target: null,
          rr: null,
        });

        expect(
          journal.checklist.find(
            (item) =>
              item.id ===
              "entry_imbalance"
          )?.passed
        ).toBe(false);
      }
    );

    it(
      "turns a no-setup result into a capital-preservation lesson",
      () => {
        const setup = createSetup({
          state: "no_setup",
          direction: "neutral",
          confidence: Number.NaN,
          structureEvent: "none",
          liquiditySweep: null,
          riskReward: null,
          entryZone: null,
          fairValueGap: null,
          displacement: {
            detected: false,
            direction: null,
            strength: 0,
            bodyRatio: 0,
            impulseSize: 0,
            candleIndex: null,
          },
        });

        const journal =
          TradeJournalEngine.create(
            setup
          );

        expect(journal.confidence).toBe(0);
        expect(journal.title).toBe(
          "Stand aside and preserve capital"
        );
        expect(journal.lesson).toContain(
          "preserving capital"
        );
      }
    );

    it(
      "returns journal evidence without sharing mutable arrays",
      () => {
        const setup = createSetup();
        const journal =
          TradeJournalEngine.create(setup);

        journal.confirmations.push(
          "New confirmation"
        );
        journal.warnings.push(
          "New warning"
        );

        expect(
          setup.explainability.confirmations
        ).toHaveLength(1);
        expect(
          setup.explainability.warnings
        ).toHaveLength(1);
      }
    );
  }
);
