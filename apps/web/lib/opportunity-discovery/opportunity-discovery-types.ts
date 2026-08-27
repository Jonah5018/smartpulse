import type {
  Opportunity,
} from "@/lib/opportunity";


export type OpportunitySource =
  | "watchlist"
  | "discovery";


export interface OpportunityCandidate {
  opportunity: Opportunity;

  source: OpportunitySource;

  score: number;
}


export interface OpportunityDiscoveryResult {
  /**
   * Highest-ranked opportunity across both
   * the trader's watchlist and the broader
   * discovery universe.
   */
  best: OpportunityCandidate | null;

  /**
   * Highest-ranked opportunity from the
   * trader's watchlist.
   */
  bestWatched:
    | OpportunityCandidate
    | null;

  /**
   * Highest-ranked opportunity outside the
   * trader's watchlist that meets the
   * SmartPulse discovery threshold.
   */
  bestDiscovery:
    | OpportunityCandidate
    | null;

  /**
   * All ranked candidates.
   */
  candidates: OpportunityCandidate[];
}