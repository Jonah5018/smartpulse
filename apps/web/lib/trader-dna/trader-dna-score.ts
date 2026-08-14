export class TraderDNAScore {
  static overall(
    consistency: number,
    discipline: number,
    adaptation: number
  ): number {
    return Math.round(
      (
        consistency +
        discipline +
        adaptation
      ) / 3
    );
  }
}