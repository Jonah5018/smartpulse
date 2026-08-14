export class MarketStructureUtils {
  static clampConfidence(
    value: number
  ): number {
    return Math.max(
      0,
      Math.min(100, value)
    );
  }
}