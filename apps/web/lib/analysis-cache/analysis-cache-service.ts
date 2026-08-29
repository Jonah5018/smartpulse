import { AnalysisCache as CoreCache } from "./analysis-cache";
import type { AnalysisSnapshot } from "./analysis-cache-types";

export class AnalysisCacheService {
  /**
   * Keep institutional snapshots for 7 days.
   *
   * Weekend Study Mode depends on this.
   */
  private static readonly SNAPSHOT_TTL =
    60 * 60 * 24 * 7;

  private static key(
    symbol: string
  ) {
    return `snapshot:${symbol.toUpperCase()}`;
  }

  /**
   * Load the latest saved snapshot.
   */
  static get(
    symbol: string
  ): AnalysisSnapshot | null {
    return CoreCache.get<AnalysisSnapshot>(
      this.key(symbol)
    );
  }

  /**
   * Save or overwrite a snapshot.
   */
  static save(
    snapshot: AnalysisSnapshot
  ): void {
    CoreCache.set(
      this.key(snapshot.symbol),
      snapshot,
      this.SNAPSHOT_TTL
    );
  }

  /**
   * Determine whether a snapshot exists.
   */
  static has(
    symbol: string
  ): boolean {
    return CoreCache.has(
      this.key(symbol)
    );
  }

  /**
   * Delete one market snapshot.
   */
  static delete(
    symbol: string
  ): void {
    CoreCache.delete(
      this.key(symbol)
    );
  }

  /**
   * Remove every saved study snapshot.
   */
  static clear(): void {
    const keys =
      CoreCache.keys();

    for (const key of keys) {
      if (
        key.startsWith(
          "snapshot:"
        )
      ) {
        CoreCache.delete(key);
      }
    }
  }
}