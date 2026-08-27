export class MarketDataError extends Error {
  readonly status: number | null;
  readonly provider: string;
  readonly retryable: boolean;

  constructor(
    message: string,
    options?: {
      status?: number | null;
      provider?: string;
      retryable?: boolean;
    }
  ) {
    super(message);

    this.name = "MarketDataError";

    this.status =
      options?.status ?? null;

    this.provider =
      options?.provider ??
      "unknown";

    this.retryable =
      options?.retryable ?? false;
  }
}