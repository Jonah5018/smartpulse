import type {
  Opportunity,
} from "./opportunity-types";

import {
  OpportunityScore,
} from "./opportunity-score";

export class OpportunityRanker {
  static rank(
    opportunities: Opportunity[]
  ): Opportunity[] {
    return opportunities
      .map(
        (
          opportunity
        ) => ({
          opportunity,

          score:
            OpportunityScore.calculate(
              opportunity
            ),
        })
      )
      .sort(
        (a, b) => {
          /*
           * Primary ranking:
           * SmartPulse opportunity score.
           */
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          /*
           * Secondary ranking:
           * confidence.
           */
          if (
            b.opportunity.confidence !==
            a.opportunity.confidence
          ) {
            return (
              b.opportunity.confidence -
              a.opportunity.confidence
            );
          }

          /*
           * Tertiary ranking:
           * READY beats FORMING.
           */
          const statePriority =
            {
              ready: 4,
              forming: 3,
              no_setup: 2,
              executed: 1,
              expired: 0,
            } as const;

          return (
            statePriority[
              b.opportunity.state
            ] -
            statePriority[
              a.opportunity.state
            ]
          );
        }
      )
      .map(
        ({
          opportunity,
        }) =>
          opportunity
      );
  }
}