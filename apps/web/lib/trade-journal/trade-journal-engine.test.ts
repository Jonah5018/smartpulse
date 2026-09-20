import {
  describe,
  expect,
  it,
} from "vitest";

import { createSetup } from "@/lib/testing/institutional-setup-fixture";

import {
  TradeJournalEngine,
} from "./trade-journal-engine";

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
