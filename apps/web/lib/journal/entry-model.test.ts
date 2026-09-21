import { describe, expect, it } from "vitest";
import { parseEntry, realizedR } from "./entry-model";
function form(values: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({symbol:"GBPUSD",direction:"buy",status:"planned",timeframe:"15min",trade_date:"2026-09-21",...values}).forEach(([key,value]) => data.set(key,value));
  return data;
}
describe("saved trade validation", () => {
  it("allows an idea without invented execution prices", () => { const entry = parseEntry(form()); expect(entry.symbol).toBe("GBP/USD"); expect(entry.entry_price).toBeNull(); expect(realizedR(entry)).toBeNull(); });
  it("requires prices before claiming execution", () => { expect(() => parseEntry(form({status:"open"}))).toThrow("require an entry"); expect(() => parseEntry(form({status:"closed",entry_price:"100",stop_loss:"90"}))).toThrow("exit price"); });
  it("rejects zero risk, wrong-side stops and invalid numbers", () => { for (const stop_loss of ["100","110","NaN","Infinity","-1"]) expect(() => parseEntry(form({entry_price:"100",stop_loss}))).toThrow(); });
  it("does not allow exits on unexecuted ideas", () => { expect(() => parseEntry(form({exit_price:"110"}))).toThrow("Only closed"); });
  it("rejects invalid dates and overlong notes", () => { expect(() => parseEntry(form({trade_date:"2026-02-30"}))).toThrow("date"); expect(() => parseEntry(form({notes:"a".repeat(5001)}))).toThrow("notes"); });
  it("measures long and short outcomes relative to initial risk", () => { expect(realizedR(parseEntry(form({status:"closed",entry_price:"100",stop_loss:"90",exit_price:"120"})))).toBe(2); expect(realizedR(parseEntry(form({status:"closed",direction:"sell",entry_price:"100",stop_loss:"110",exit_price:"120"})))).toBe(-2); });
  it("does not accept unrelated fields as ownership or saved evidence", () => { expect(parseEntry(form({user_id:"someone-else",snapshot:"fake"}))).not.toHaveProperty("user_id"); expect(parseEntry(form({snapshot:"fake"}))).not.toHaveProperty("snapshot"); });
});
