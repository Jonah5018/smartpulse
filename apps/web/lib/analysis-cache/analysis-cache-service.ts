import type {
  AnalysisSnapshot,
} from "./analysis-cache-types";

export class AnalysisCache {
  private static cache =
    new Map<string, AnalysisSnapshot>();

  static get(
    symbol: string
  ) {
    return this.cache.get(
      symbol.toUpperCase()
    ) ?? null;
  }

  static save(
    snapshot: AnalysisSnapshot
  ) {
    this.cache.set(
      snapshot.symbol.toUpperCase(),
      snapshot
    );
  }

  static has(
    symbol: string
  ) {
    return this.cache.has(
      symbol.toUpperCase()
    );
  }

  static clear() {
    this.cache.clear();
  }
}