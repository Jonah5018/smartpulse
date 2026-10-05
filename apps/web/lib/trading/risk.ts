import type {
  AccountRiskSnapshot,
  InstrumentSpecification,
  ProtectedOrder,
  RiskLimits,
} from "./types";

export function assessRisk(
  order: ProtectedOrder,
  account: AccountRiskSnapshot,
  spec: InstrumentSpecification | null,
  limits: RiskLimits,
  spread: number,
) {
  const reasons: string[] = [];
  const positive = (n: number) => Number.isFinite(n) && n > 0;
  if (
    !spec ||
    !Object.values(spec).every(positive) ||
    spec.minQuantity > spec.maxQuantity
  )
    return {
      approved: false,
      reasons: ["Verified instrument metadata is missing or invalid."],
      quantity: 0,
      risk: 0,
    };
  if (
    !Object.values(limits).every(positive) ||
    limits.riskPercent > 1 ||
    limits.aggregateRiskPercent > 5 ||
    limits.dailyLossPercent > 5 ||
    limits.weeklyLossPercent > 10 ||
    limits.drawdownPercent > 20 ||
    limits.minRewardRisk < 2 ||
    !Number.isInteger(limits.maxPositions) ||
    !Number.isInteger(limits.maxTradesPerDay)
  ) {
    return {
      approved: false,
      reasons: ["Risk limits are outside the supported bounds."],
      quantity: 0,
      risk: 0,
    };
  }
  if (
    !Object.values(account).every((n) => Number.isFinite(n) && n >= 0) ||
    !positive(account.equity) ||
    account.peakEquity < account.equity ||
    ![order.entry, order.stop, order.target].every(positive) ||
    !Number.isFinite(spread) ||
    spread < 0 ||
    !["buy", "sell"].includes(order.direction)
  ) {
    return {
      approved: false,
      reasons: ["Account, prices or spread are invalid."],
      quantity: 0,
      risk: 0,
    };
  }
  const distance =
    (order.entry - order.stop) * (order.direction === "buy" ? 1 : -1);
  const reward =
    (order.target - order.entry) * (order.direction === "buy" ? 1 : -1);
  if (distance <= 0 || reward <= 0)
    return {
      approved: false,
      reasons: ["Stop and target must protect the selected direction."],
      quantity: 0,
      risk: 0,
    };
  if (reward / distance < limits.minRewardRisk)
    reasons.push("Reward-to-risk is below the minimum.");
  // Include the slippage allowance in sizing, never round a size up to a minimum.
  const lossPerQuantity =
    (distance / spec.tickSize + limits.maxSlippageTicks) * spec.lossTickValue;
  const budget = (account.equity * limits.riskPercent) / 100;
  const raw = Math.min(
    budget / lossPerQuantity,
    spec.maxQuantity,
    limits.maxQuantity,
    account.freeMargin / spec.marginPerQuantity,
  );
  const quantity = Math.floor(raw / spec.quantityStep) * spec.quantityStep;
  const risk = quantity * lossPerQuantity;
  if (
    !positive(quantity) ||
    quantity < spec.minQuantity ||
    !Number.isFinite(risk) ||
    risk > budget * (1 + 1e-10)
  )
    reasons.push(
      "The permitted quantity is below the broker minimum or exceeds risk.",
    );
  if (spread / spec.tickSize > limits.maxSpreadTicks)
    reasons.push("Spread exceeds the limit.");
  if (
    account.dailyLoss + account.openRisk + risk >
    (account.equity * limits.dailyLossPercent) / 100
  )
    reasons.push("Daily loss budget would be exceeded.");
  if (
    account.weeklyLoss + account.openRisk + risk >
    (account.equity * limits.weeklyLossPercent) / 100
  )
    reasons.push("Weekly loss budget would be exceeded.");
  if (
    ((account.peakEquity - account.equity + account.openRisk + risk) /
      account.peakEquity) *
      100 >
    limits.drawdownPercent
  )
    reasons.push("Drawdown limit would be exceeded.");
  if (
    account.openRisk + risk >
    (account.equity * limits.aggregateRiskPercent) / 100
  )
    reasons.push("Aggregate open risk would be exceeded.");
  if (
    account.instrumentRisk + risk >
    (account.equity * limits.instrumentRiskPercent) / 100
  )
    reasons.push("Instrument exposure would be exceeded.");
  if (account.positions >= limits.maxPositions)
    reasons.push("Maximum concurrent positions reached.");
  if (account.tradesToday >= limits.maxTradesPerDay)
    reasons.push("Daily trade count reached.");
  if (account.consecutiveLosses >= limits.cooldownLosses)
    reasons.push("Consecutive-loss cooldown is active.");
  return { approved: reasons.length === 0, reasons, quantity, risk };
}
