import type {
  MarketScanInput,
  MarketScanResult,
  MarketScanStatus,
} from "./market-scanner-types";


export class MarketScanner {
  static scan(
    markets: MarketScanInput[]
  ): MarketScanResult[] {
    return markets
      .map(
        (market) => {
          const score =
            this.calculateScore(
              market
            );

          return {
            symbol:
              market.symbol,

            name:
              market.name,

            type:
              market.type,

            tier:
              market.tier,

            priority:
              market.priority,

            status:
              this.getStatus(
                score
              ),

            score,

            changePercent:
              market.changePercent,

            reason:
              this.getReason(
                market,
                score
              ),
          };
        }
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );
  }


  private static calculateScore(
    market: MarketScanInput
  ): number {
    const priorityScore =
      Math.min(
        50,
        Math.round(
          market.priority *
          0.5
        )
      );

    const movementScore =
      Math.min(
        35,
        Math.round(
          Math.abs(
            market.changePercent
          ) * 10
        )
      );

    const tierBonus =
      market.tier === "core"
        ? 15
        : market.tier ===
          "secondary"
        ? 8
        : 0;

    return Math.min(
      100,
      Math.max(
        0,
        priorityScore +
          movementScore +
          tierBonus
      )
    );
  }


  private static getStatus(
    score: number
  ): MarketScanStatus {
    if (
      score >= 90
    ) {
      return "priority";
    }

    if (
      score >= 75
    ) {
      return "watch";
    }

    if (
      score >= 50
    ) {
      return "candidate";
    }

    return "excluded";
  }


  private static getReason(
    market: MarketScanInput,
    score: number
  ): string {
    const direction =
      market.changePercent > 0
        ? "positive"
        : market.changePercent < 0
        ? "negative"
        : "flat";

    return (
      `${market.tier} market with ` +
      `${direction} price movement ` +
      `of ${Math.abs(
        market.changePercent
      ).toFixed(2)}%. ` +
      `Scanner score: ${score}.`
    );
  }
}