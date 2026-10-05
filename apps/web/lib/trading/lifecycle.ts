import type { OrderState } from "./types";
const transitions: Record<OrderState, OrderState[]> = {
  created: ["awaiting_approval", "validating", "rejected", "expired"],
  awaiting_approval: ["approved", "cancelled", "expired"],
  approved: ["validating", "cancelled", "expired"],
  validating: ["submitting", "rejected", "expired"],
  submitting: [
    "submitted",
    "filled",
    "partially_filled",
    "rejected",
    "unknown",
  ],
  submitted: ["filled", "partially_filled", "cancelled", "unknown"],
  unknown: [
    "submitted",
    "filled",
    "partially_filled",
    "closed",
    "cancelled",
    "rejected",
  ],
  partially_filled: ["filled", "closing", "cancelled", "unknown"],
  filled: ["closing", "closed", "unknown"],
  closing: ["closed", "unknown"],
  closed: [],
  rejected: [],
  cancelled: [],
  expired: [],
};
export function transitionOrder(from: OrderState, to: OrderState) {
  if (!transitions[from]?.includes(to))
    throw new Error("Invalid order transition: " + from + " → " + to);
  return to;
}
export function maySubmit(state: OrderState) {
  return state === "validating";
}
