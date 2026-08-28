interface Entry<T> {
  value: T;
  expires: number;
}

export class AnalysisCache {
  private static store =
    new Map<string, Entry<unknown>>();

  static get<T>(
    key: string
  ): T | null {
    const item =
      this.store.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  static set<T>(
    key: string,
    value: T,
    ttlSeconds = 60
  ) {
    this.store.set(key, {
      value,
      expires:
        Date.now() +
        ttlSeconds * 1000,
    });
  }

  static clear() {
    this.store.clear();
  }
}