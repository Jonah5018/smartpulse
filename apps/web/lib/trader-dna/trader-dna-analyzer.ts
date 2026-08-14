import type {
  TraderDNA,
} from "./trader-dna-types";

export class TraderDNAAnalyzer {
  static summary(
    dna: TraderDNA
  ): string {
    return `Current win rate: ${dna.performance.winRate}% | Preferred session: ${dna.behaviour.preferredTradingSession}`;
  }
}