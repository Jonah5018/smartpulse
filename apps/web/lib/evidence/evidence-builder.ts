import type {
  Evidence,
} from "./evidence-types";

export class EvidenceBuilder {
  private readonly evidence: Evidence[] =
    [];

  add(
    title: string,
    passed: boolean,
    description: string,
    weight = 1
  ) {
    this.evidence.push({
      title,
      passed,
      description,
      weight,
    });

    return this;
  }

  build(): Evidence[] {
    return this.evidence;
  }
}