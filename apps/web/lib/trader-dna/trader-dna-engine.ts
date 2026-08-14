import type {
  TraderDNA,
} from "./trader-dna-types";

export class TraderDNAEngine {
  static evaluate(
    dna: TraderDNA
  ): number {
    return (
      dna.learning
        .experienceScore +
      dna.learning
        .disciplineScore +
      dna.learning
        .adaptationScore
    ) / 3;
  }
}