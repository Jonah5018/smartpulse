import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { tradingCapabilities, modeEntitled } from "./capabilities";
import { assessRisk } from "./risk";
import { DEFAULT_RISK, type AccountRiskSnapshot } from "./types";
import { inNewsWindow, executionPolicy, type PolicyInput } from "./policy";
import { transitionOrder, maySubmit } from "./lifecycle";
import { paperExit } from "./paper";
import { sealCredential, openCredential } from "./credentials";
import { MetaApiDemoReader } from "./metaapi-demo";
import { reconcileOrder } from "./reconciliation";
import { qualifySetup } from "./qualification";
import type { MarketCandle } from "@/lib/market";

const order = {
  symbol: "EUR/USD",
  direction: "buy" as const,
  entry: 100,
  stop: 90,
  target: 120,
};
const spec = {
  tickSize: 1,
  lossTickValue: 1,
  minQuantity: 0.1,
  maxQuantity: 100,
  quantityStep: 0.1,
  marginPerQuantity: 1,
};
const account: AccountRiskSnapshot = {
  equity: 10000,
  peakEquity: 10000,
  dailyLoss: 0,
  weeklyLoss: 0,
  openRisk: 0,
  instrumentRisk: 0,
  positions: 0,
  tradesToday: 0,
  freeMargin: 10000,
  consecutiveLosses: 0,
};
const policy: PolicyInput = {
  plan: "pro",
  mode: "paper",
  enabled: true,
  globalEnabled: true,
  userStopped: false,
  accountStopped: false,
  brokerEnabled: true,
  connectionHealthy: true,
  instrumentAllowed: true,
  marketOpen: true,
  sessionAllowed: true,
  newsVerified: true,
  newsBlocked: false,
  riskApproved: true,
  qualified: true,
  approvedByUser: true,
  duplicate: false,
};
describe("execution boundaries", () => {
  it("centralizes plan eligibility without enabling any real order mode", () => {
    expect(tradingCapabilities("basic").brokerConnection).toBe(false);
    expect(modeEntitled("pro", "full_auto")).toBe(false);
    expect(modeEntitled("elite", "full_auto")).toBe(true);
    expect(
      executionPolicy({ ...policy, plan: "elite", mode: "full_auto" }),
    ).not.toEqual([]);
    expect(executionPolicy(policy)).toEqual([]);
  });
  it.each([
    "enabled",
    "globalEnabled",
    "brokerEnabled",
    "connectionHealthy",
    "instrumentAllowed",
    "marketOpen",
    "sessionAllowed",
    "newsVerified",
    "riskApproved",
    "qualified",
    "approvedByUser",
  ] as const)("blocks when %s is false", (key) =>
    expect(executionPolicy({ ...policy, [key]: false })).not.toEqual([]),
  );
  it.each([
    "userStopped",
    "accountStopped",
    "newsBlocked",
    "duplicate",
  ] as const)("blocks when %s is true", (key) =>
    expect(executionPolicy({ ...policy, [key]: true })).not.toEqual([]),
  );
  it("requires structured evidence, not a narrative", () =>
    expect(qualifySetup(null, new Date().toISOString()).state).toBe(
      "insufficient_data",
    ));
  it("blocks both sides of a high impact news event", () => {
    const now = Date.now(),
      events = [{ time: new Date(now).toISOString(), highImpact: true }];
    expect(inNewsWindow(events, now - 29 * 60000)).toBe(true);
    expect(inNewsWindow(events, now + 29 * 60000)).toBe(true);
    expect(inNewsWindow(events, now + 31 * 60000)).toBe(false);
  });
  it("never resubmits an ambiguous broker result", () => {
    expect(maySubmit("unknown")).toBe(false);
    expect(() => transitionOrder("unknown", "submitting")).toThrow();
    expect(
      reconcileOrder({ clientId: "a", state: "unknown", quantity: 1 }, []),
    ).toMatchObject({ state: "unknown", mayResubmit: false });
  });
});
describe("risk", () => {
  it("rounds down and includes slippage in risk", () => {
    const result = assessRisk(order, account, spec, DEFAULT_RISK, 1);
    expect(result.approved).toBe(true);
    expect(result.quantity).toBeCloseTo(4.1);
    expect(result.risk).toBeLessThanOrEqual(50);
  });
  it.each([
    { equity: NaN },
    { dailyLoss: 200 },
    { weeklyLoss: 500 },
    { peakEquity: 12000 },
    { positions: 2 },
    { openRisk: 100 },
    { instrumentRisk: 50 },
    { tradesToday: 5 },
    { consecutiveLosses: 3 },
  ])("blocks unsafe account inputs %j", (change) =>
    expect(
      assessRisk(order, { ...account, ...change }, spec, DEFAULT_RISK, 1)
        .approved,
    ).toBe(false),
  );
  it("rejects missing metadata, zero stop distance and wrong-side target", () => {
    expect(assessRisk(order, account, null, DEFAULT_RISK, 1).approved).toBe(
      false,
    );
    expect(
      assessRisk({ ...order, stop: 100 }, account, spec, DEFAULT_RISK, 1)
        .approved,
    ).toBe(false);
    expect(
      assessRisk({ ...order, target: 80 }, account, spec, DEFAULT_RISK, 1)
        .approved,
    ).toBe(false);
  });
  it("does not round an undersized trade up", () =>
    expect(
      assessRisk(order, account, { ...spec, minQuantity: 10 }, DEFAULT_RISK, 1)
        .approved,
    ).toBe(false));
});
describe("paper price handling", () => {
  const candle = {
    open: 100,
    low: 85,
    high: 125,
    close: 110,
    timestamp: "2026-10-01T01:00:00Z",
  } as MarketCandle;
  it("chooses the stop when OHLC order is unknowable", () =>
    expect(paperExit(order, [candle])).toMatchObject({
      price: 90,
      reason: "stop",
    }));
  it("models adverse gaps through a stop", () =>
    expect(paperExit(order, [{ ...candle, open: 80 }])).toMatchObject({
      price: 80,
      reason: "stop",
    }));
});
describe("credential and demo bridge boundary", () => {
  const key = Buffer.alloc(32, 8).toString("base64");
  it("binds authenticated encryption to owner and connection", () => {
    const sealed = sealCredential("test-token", key, "user:account");
    expect(sealed).not.toContain("test-token");
    expect(openCredential(sealed, key, "user:account")).toBe("test-token");
    expect(() => openCredential(sealed, key, "other:account")).toThrow();
  });
  it("rejects a real account and never includes secrets in errors", async () => {
    const transport = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ platform: "mt5", type: "ACCOUNT_TRADE_MODE_REAL" }),
        ),
      );
    await expect(
      new MetaApiDemoReader(
        "account-123",
        "private-token",
        transport,
      ).getAccount(),
    ).rejects.toThrow("demo");
  });
  it("returns only approved demo fields", async () => {
    const transport = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          platform: "mt5",
          type: "ACCOUNT_TRADE_MODE_DEMO",
          currency: "USD",
          balance: 100,
          equity: 100,
          freeMargin: 100,
          name: "Private",
          login: 123,
        }),
      ),
    );
    const result = await new MetaApiDemoReader(
      "account-123",
      "private-token",
      transport,
    ).getAccount();
    expect(result.demo).toBe(true);
    expect(result).not.toHaveProperty("name");
    expect(result).not.toHaveProperty("login");
  });
  it("sanitizes transport failures", async () => {
    const transport = vi.fn().mockRejectedValue(new Error("private-token"));
    await expect(
      new MetaApiDemoReader(
        "account-123",
        "private-token",
        transport,
      ).getAccount(),
    ).rejects.toThrow("Bridge unavailable");
  });
});
