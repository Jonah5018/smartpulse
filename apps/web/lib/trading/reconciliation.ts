import type { BrokerOrder } from "./broker";
import type { OrderState } from "./types";

/** Broker truth can resolve ambiguity; absence alone never grants resubmission. */
export function reconcileOrder(
  local: { clientId: string; state: OrderState; quantity: number },
  remote: BrokerOrder[],
) {
  const matches = remote.filter((order) => order.clientId === local.clientId);
  if (matches.length !== 1)
    return {
      state: "unknown" as OrderState,
      requiresReview: true,
      mayResubmit: false,
    };
  const order = matches[0];
  if (
    !Number.isFinite(order.filledQuantity) ||
    order.filledQuantity < 0 ||
    order.filledQuantity > local.quantity ||
    order.quantity !== local.quantity
  )
    return {
      state: "unknown" as OrderState,
      requiresReview: true,
      mayResubmit: false,
    };
  return { state: order.state, requiresReview: false, mayResubmit: false };
}
