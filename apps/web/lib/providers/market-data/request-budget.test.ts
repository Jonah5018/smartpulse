import { afterEach, describe, expect, it, vi } from "vitest";
import { RequestBudget } from "./request-budget";
import { MarketDataError } from "./market-data-errors";

afterEach(() => vi.useRealTimers());

describe("provider admission control", () => {
  it("limits credits and allows work after the rolling window", async () => {
    vi.useFakeTimers();
    const budget = new RequestBudget(2, 1);
    const operation = vi.fn().mockResolvedValue(1);

    await budget.run(operation);
    await budget.run(operation);
    await expect(budget.run(operation)).rejects.toMatchObject({ status: 429 });
    expect(operation).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(60_000);
    await expect(budget.run(operation)).resolves.toBe(1);
  });

  it("holds queued requests within the concurrency limit", async () => {
    const budget = new RequestBudget(8, 1);
    let release!: () => void;
    const first = budget.run(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const secondOperation = vi.fn().mockResolvedValue(2);
    const second = budget.run(secondOperation);

    expect(secondOperation).not.toHaveBeenCalled();
    release();
    await first;
    await expect(second).resolves.toBe(2);
  });

  it("backs off after provider 429 without extending cooldown on local denials", async () => {
    vi.useFakeTimers();
    const budget = new RequestBudget(8, 1);
    await expect(
      budget.run(async () => {
        throw new MarketDataError("Quota", { status: 429 });
      }),
    ).rejects.toMatchObject({ status: 429 });

    vi.advanceTimersByTime(30_000);
    const operation = vi.fn().mockResolvedValue(1);
    await expect(budget.run(operation)).rejects.toMatchObject({ status: 429 });
    expect(operation).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    await expect(budget.run(operation)).resolves.toBe(1);
  });
});
