import { expect, it } from "vitest";
import { executionResult, validateAccounting } from "./accounting";
import type { SavedJournalEntry } from "./entry-model";
const entry = {
  status: "closed",
  direction: "buy",
  entry_price: 100,
  stop_loss: 90,
  exit_price: 115,
  accounting: {
    currency: "USD",
    quantity: 2,
    unitValue: 1,
    fees: 3,
    exits: [
      { quantity: 1, price: 110 },
      { quantity: 1, price: 120 },
    ],
  },
} as SavedJournalEntry;
it("includes partial exits and fees in cash and R", () => {
  expect(executionResult(entry)).toMatchObject({
    gross: 30,
    net: 27,
    netR: 1.35,
    remaining: 0,
  });
});
it("rejects over-closing and non-finite metadata", () => {
  expect(() =>
    validateAccounting({ ...entry.accounting, quantity: 1 }),
  ).toThrow();
  expect(() =>
    validateAccounting({ ...entry.accounting, unitValue: Infinity }),
  ).toThrow();
});
it("does not invent cash results for historical price-only trades", () =>
  expect(executionResult({ ...entry, accounting: null })).toBeNull());
it("does not count partially closed positions as complete", () =>
  expect(
    executionResult({
      ...entry,
      accounting: {
        ...entry.accounting!,
        exits: [{ quantity: 1, price: 110 }],
      },
    }),
  ).toBeNull());
