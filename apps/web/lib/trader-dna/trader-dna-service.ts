import type {
  TraderDNA,
} from "./trader-dna-types";

import { TraderDNAEngine } from "./trader-dna-engine";

export class TraderDNAService {
  static score(
    dna: TraderDNA
  ) {
    return TraderDNAEngine.evaluate(
      dna
    );
  }
}