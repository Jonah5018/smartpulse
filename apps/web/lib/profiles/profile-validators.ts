import type {
  TraderProfileDraft,
} from "./profile-types";

import {
  InvalidProfileDataError,
} from "./profile-errors";

export class TraderProfileValidator {
  static validate(
    draft: TraderProfileDraft
  ): TraderProfileDraft {
    if (
      !draft.experience_level
    ) {
      throw new InvalidProfileDataError(
        "Experience level is required."
      );
    }

    if (
      draft.trading_styles.length === 0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one trading style."
      );
    }

    if (
      draft.preferred_timeframes.length ===
      0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one timeframe."
      );
    }

    if (
      draft.market_categories.length ===
      0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one market category."
      );
    }

    if (
      draft.favorite_markets.length ===
      0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one market."
      );
    }

    if (
      draft.goals.length === 0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one goal."
      );
    }

    if (
      draft.challenges.length === 0
    ) {
      throw new InvalidProfileDataError(
        "Select at least one challenge."
      );
    }

    return draft;
  }

  /**
   * Validate an IANA timezone.
   *
   * Examples:
   *
   * Africa/Lagos
   * Europe/London
   * America/New_York
   * Asia/Tokyo
   */
  static isValidTimezone(
    timezone: string
  ): boolean {
    try {
      Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            timezone,
        }
      ).format();

      return true;
    } catch {
      return false;
    }
  }

  static validateTimezone(
    timezone: string | null
  ): string | null {
    if (!timezone) {
      return null;
    }

    if (
      !this.isValidTimezone(
        timezone
      )
    ) {
      throw new InvalidProfileDataError(
        `Invalid timezone: ${timezone}.`
      );
    }

    return timezone;
  }
}