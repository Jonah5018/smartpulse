interface Entry<T> {
  value: T;
  expires: number;
}

export class AnalysisCache {
  private static store =
    new Map<string, Entry<unknown>>();

  /**
   * Read a cache entry.
   *
   * Expired entries are removed automatically.
   */
  static get<T>(
    key: string
  ): T | null {
    const item =
      this.store.get(key);

    if (!item) {
      return null;
    }

    if (
      Date.now() >= item.expires
    ) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Store any value with a configurable TTL.
   */
  static set<T>(
    key: string,
    value: T,
    ttlSeconds = 60
  ): void {
    this.store.set(key, {
      value,
      expires:
        Date.now() +
        ttlSeconds * 1000,
    });
  }

  /**
   * Check whether a key exists without
   * returning the value.
   */
  static has(
    key: string
  ): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove one cache entry.
   */
  static delete(
    key: string
  ): void {
    this.store.delete(key);
  }

  /**
   * Remaining lifetime in seconds.
   */
  static ttl(
    key: string
  ): number | null {
    const item =
      this.store.get(key);

    if (!item) {
      return null;
    }

    const remaining =
      Math.ceil(
        (item.expires -
          Date.now()) /
          1000
      );

    if (remaining <= 0) {
      this.store.delete(key);
      return null;
    }

    return remaining;
  }

  /**
   * Return every non-expired cache key.
   */
  static keys(): string[] {
    const valid: string[] = [];

    for (const key of this.store.keys()) {
      if (this.has(key)) {
        valid.push(key);
      }
    }

    return valid;
  }

  /**
   * Remove everything.
   */
  static clear(): void {
    this.store.clear();
  }
}
