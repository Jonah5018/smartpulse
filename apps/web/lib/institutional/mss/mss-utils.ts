export class MSSUtils {
  static confidence(
    displacement: boolean,
    liquiditySweep: boolean
  ): number {
    let score = 60;

    if (displacement) score += 20;

    if (liquiditySweep) score += 20;

    return Math.min(score, 100);
  }
}