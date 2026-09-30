import { MarketDataError } from "./market-data-errors";

function positiveInteger(value: string | undefined, fallback: number): number {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : fallback;
}

/** Process-local admission control. Credits count symbols, not HTTP batches. */
export class RequestBudget {
  private active = 0;
  private starts: number[] = [];
  private cooldownUntil = 0;
  private waiting: Array<() => void> = [];

  constructor(
    private readonly creditsPerMinute = positiveInteger(
      process.env.TWELVE_DATA_CREDITS_PER_MINUTE,
      8,
    ),
    private readonly concurrency = positiveInteger(
      process.env.TWELVE_DATA_CONCURRENCY,
      2,
    ),
  ) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    if (this.waiting.length >= 32) throw this.limited();

    if (this.active >= this.concurrency) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    } else {
      this.active++;
    }

    let admitted = false;

    try {
      const now = Date.now();
      this.starts = this.starts.filter((start) => now - start < 60_000);

      if (now < this.cooldownUntil || this.starts.length >= this.creditsPerMinute) {
        throw this.limited();
      }

      this.starts.push(now);
      admitted = true;
      return await operation();
    } catch (error) {
      if (admitted && error instanceof MarketDataError && error.status === 429) {
        this.cooldownUntil = Math.max(this.cooldownUntil, Date.now() + 60_000);
      }

      throw error;
    } finally {
      const next = this.waiting.shift();

      if (next) next();
      else this.active--;
    }
  }

  private limited(): MarketDataError {
    return new MarketDataError(
      "Market data credit budget exhausted; retry after the cooldown.",
      {
        status: 429,
        provider: "twelve-data",
        retryable: true,
      },
    );
  }
}
