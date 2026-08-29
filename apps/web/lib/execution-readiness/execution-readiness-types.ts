export type ExecutionState =
  | "ready"
  | "forming"
  | "no_setup";

export interface ExecutionReadiness {
  state: ExecutionState;

  score: number;

  confirmations: string[];

  missing: string[];

  explanation: string;
}