import {
  describe,
  expect,
  it,
} from "vitest";

import {
  OpportunityDiscoveryService,
  SMARTPULSE_DISCOVERY_THRESHOLD,
} from "./opportunity-discovery-service";

import type {
  Opportunity,
} from "@/lib/opportunity";


function createOpportunity(
  overrides: Partial<Opportunity> = {}
): Opportunity {
  return {
    symbol: "GBP/USD",

    state: "ready",

    confidence: 80,

    direction: "buy",

    quality: "high",

    setupContext: "with_context",

    structure: "bullish",

    structureEvent: "bos",

    higherTimeframeBias: "bullish",

    contextTimeframe: "1h",

    contextTrend: "bullish",

    structureTimeframe: "15min",

    executionTimeframe: "5min",

    multiTimeframeAlignment:
      "aligned",

    nearestBuySideLiquidity:
      1.3000,

    nearestSellSideLiquidity:
      null,

    liquiditySweep:
      "sell_side",

    displacement:
      "bullish",

    entryZone: {
      low: 1.2950,

      high: 1.2970,

      midpoint: 1.2960,
    },

    invalidation:
      1.2900,

    targetLiquidity:
      1.3150,

    riskReward: {
      entry: 1.2960,

      stopLoss: 1.2900,

      target: 1.3150,

      risk: 0.0060,

      reward: 0.0190,

      ratio: 3.17,
    },

    summary:
      "Strong bullish institutional setup.",

    explanation:
      "Multi-timeframe structure is aligned with strong liquidity and displacement.",

    ...overrides,
  };
}


describe(
  "OpportunityDiscoveryService",
  () => {

    it(
      "requires an outside-watchlist opportunity to meet the discovery threshold",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",

                confidence:
                  70,
              }),

            "XAU/USD":
              createOpportunity({
                symbol:
                  "XAU/USD",

                /*
                 * Deliberately create a weak
                 * outside-watchlist setup.
                 *
                 * Score remains well below 80.
                 */
                state:
                  "forming",

                confidence:
                  70,

                quality:
                  "low",

                multiTimeframeAlignment:
                  "countertrend",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            ["XAU/USD"]
          );


        expect(
          SMARTPULSE_DISCOVERY_THRESHOLD
        ).toBe(80);


        expect(
          result.bestWatched
        ).not.toBeNull();


        /*
         * XAU/USD is outside the watchlist
         * but does not meet the discovery
         * threshold.
         */
        expect(
          result.bestDiscovery
        ).toBeNull();


        /*
         * GBP/USD remains the strongest
         * actionable opportunity.
         */
        expect(
          result.best?.opportunity.symbol
        ).toBe("GBP/USD");


        expect(
          result.best?.source
        ).toBe("watchlist");
      }
    );


    it(
      "surfaces a strong opportunity outside the watchlist as discovery",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",

                confidence:
                  50,

                quality:
                  "moderate",
              }),

            "XAU/USD":
              createOpportunity({
                symbol:
                  "XAU/USD",

                confidence:
                  100,

                quality:
                  "exceptional",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            ["XAU/USD"]
          );


        expect(
          result.bestDiscovery
        ).not.toBeNull();


        expect(
          result.bestDiscovery
            ?.opportunity.symbol
        ).toBe("XAU/USD");


        expect(
          result.bestDiscovery?.source
        ).toBe("discovery");


        expect(
          result.bestDiscovery?.score
        ).toBeGreaterThanOrEqual(
          SMARTPULSE_DISCOVERY_THRESHOLD
        );


        /*
         * The strong discovery opportunity
         * becomes the overall best opportunity.
         */
        expect(
          result.best?.opportunity.symbol
        ).toBe("XAU/USD");


        expect(
          result.best?.source
        ).toBe("discovery");
      }
    );


    it(
      "allows the strongest watchlist opportunity to remain primary when discovery is weaker",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",

                confidence:
                  95,

                quality:
                  "exceptional",
              }),

            "XAU/USD":
              createOpportunity({
                symbol:
                  "XAU/USD",

                /*
                 * Still a valid setup, but weaker
                 * than GBP/USD.
                 */
                state:
                  "forming",

                confidence:
                  85,

                quality:
                  "high",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            ["XAU/USD"]
          );


        expect(
          result.bestWatched
            ?.opportunity.symbol
        ).toBe("GBP/USD");


        expect(
          result.best?.opportunity.symbol
        ).toBe("GBP/USD");


        expect(
          result.best?.source
        ).toBe("watchlist");
      }
    );


    it(
      "selects the highest-scoring qualifying discovery",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",

                confidence:
                  50,

                quality:
                  "moderate",
              }),

            "XAU/USD":
              createOpportunity({
                symbol:
                  "XAU/USD",

                /*
                 * Qualifies for discovery,
                 * but deliberately scores lower
                 * than USD/JPY.
                 */
                state:
                  "forming",

                confidence:
                  85,

                quality:
                  "exceptional",
              }),

            "USD/JPY":
              createOpportunity({
                symbol:
                  "USD/JPY",

                /*
                 * Stronger ready setup.
                 */
                state:
                  "ready",

                confidence:
                  100,

                quality:
                  "exceptional",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            [
              "XAU/USD",
              "USD/JPY",
            ]
          );


        expect(
          result.bestDiscovery
            ?.opportunity.symbol
        ).toBe("USD/JPY");


        expect(
          result.bestDiscovery?.score
        ).toBeGreaterThanOrEqual(
          SMARTPULSE_DISCOVERY_THRESHOLD
        );
      }
    );


    it(
      "never treats a discovery market as a discovery when it is below the threshold",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",

                confidence:
                  80,
              }),

            "XAU/USD":
              createOpportunity({
                symbol:
                  "XAU/USD",

                confidence:
                  80,

                quality:
                  "low",

                multiTimeframeAlignment:
                  "countertrend",

                state:
                  "forming",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            ["XAU/USD"]
          );


        expect(
          result.bestDiscovery
        ).toBeNull();


        expect(
          result.best?.source
        ).toBe("watchlist");


        expect(
          result.best?.opportunity.symbol
        ).toBe("GBP/USD");
      }
    );


    it(
      "does not allow a market to be both watchlist and discovery",
      () => {
        const opportunities =
          {
            "GBP/USD":
              createOpportunity({
                symbol:
                  "GBP/USD",
              }),
          };


        const result =
          OpportunityDiscoveryService.rank(
            opportunities,

            ["GBP/USD"],

            ["GBP/USD"]
          );


        expect(
          result.bestWatched
            ?.opportunity.symbol
        ).toBe("GBP/USD");


        expect(
          result.bestWatched?.source
        ).toBe("watchlist");


        expect(
          result.bestDiscovery
        ).toBeNull();
      }
    );


    it(
      "returns null selections when there are no valid candidates",
      () => {
        const result =
          OpportunityDiscoveryService.rank(
            {},

            ["GBP/USD"],

            ["XAU/USD"]
          );


        expect(
          result.best
        ).toBeNull();


        expect(
          result.bestWatched
        ).toBeNull();


        expect(
          result.bestDiscovery
        ).toBeNull();


        expect(
          result.candidates
        ).toHaveLength(0);
      }
    );

  }
);