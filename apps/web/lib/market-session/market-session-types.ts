export type TradingSession =
  | "sydney"
  | "tokyo"
  | "london"
  | "new_york"
  | "closed";

export type SessionOverlap =
  | "none"
  | "london_new_york"
  | "sydney_tokyo"
  | "tokyo_london";

export interface SessionStatus {
  current: TradingSession;

  isOpen: boolean;

  description: string;

  nextSession: TradingSession;

  nextSessionStartsAt: string | null;

  overlap: SessionOverlap;
}

/**
 * User-facing session information.
 *
 * `sessionTimezone` identifies the actual market
 * timezone, while `userTimezone` identifies the
 * timezone in which the trader is viewing it.
 */
export interface LocalizedSessionStatus
  extends SessionStatus {
  sessionTimezone: string;

  userTimezone: string;

  localTime: string;

  nextSessionStartsAtLocal: string | null;
}