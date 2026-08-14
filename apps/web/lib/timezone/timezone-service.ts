import {
  TraderProfileValidator,
} from "@/lib/profiles/profile-validators";

import type {
  TimezoneMode,
  TimezonePreference,
} from "./timezone-types";

export class TimezoneService {
  /**
   * Get the timezone currently configured
   * by the user's device/browser.
   *
   * Example:
   *
   * Africa/Lagos
   * Europe/London
   * America/New_York
   */
  static detectBrowserTimezone(): string {
    const timezone =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone;

    if (
      !timezone ||
      !TraderProfileValidator.isValidTimezone(
        timezone
      )
    ) {
      return "UTC";
    }

    return timezone;
  }

  /**
   * Resolve the timezone SmartPulse should
   * currently display to the user.
   *
   * AUTO:
   * Follow the device's current timezone.
   *
   * MANUAL:
   * Use the saved timezone.
   */
  static resolve(
    preference?: TimezonePreference
  ): string {
    const mode: TimezoneMode =
      preference?.mode ??
      "auto";

    if (
      mode === "auto"
    ) {
      return this.detectBrowserTimezone();
    }

    if (
      preference?.timezone &&
      TraderProfileValidator.isValidTimezone(
        preference.timezone
      )
    ) {
      return preference.timezone;
    }

    return this.detectBrowserTimezone();
  }

  /**
   * Format a timestamp in the user's
   * resolved timezone.
   */
  static format(
    timestamp: string | Date,
    preference?: TimezonePreference,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const timezone =
      this.resolve(
        preference
      );

    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp);

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone:
          timezone,
        ...options,
      }
    ).format(date);
  }

  /**
   * Get the user's current UTC offset.
   *
   * This is useful for displaying:
   *
   * GMT+1
   * GMT+0
   * GMT-4
   */
  static getOffset(
    preference?: TimezonePreference
  ): string {
    const timezone =
      this.resolve(
        preference
      );

    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: timezone,
          timeZoneName:
            "longOffset",
        }
      ).formatToParts(
        new Date()
      );

    return (
      parts.find(
        (part) =>
          part.type ===
          "timeZoneName"
      )?.value ??
      "GMT"
    );
  }
}