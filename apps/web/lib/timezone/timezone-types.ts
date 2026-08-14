export type TimezoneMode =
  | "auto"
  | "manual";

export interface TimezonePreference {
  mode: TimezoneMode;

  timezone: string | null;
}