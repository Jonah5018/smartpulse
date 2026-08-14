"use client";

import { useEffect, useState } from "react";

import {
  TimezoneService,
} from "@/lib/timezone";

export function TimezoneDisplay() {
  const [timezone, setTimezone] =
    useState<string | null>(null);

  const [localTime, setLocalTime] =
    useState<string | null>(null);

  useEffect(() => {
    const detectedTimezone =
      TimezoneService.detectBrowserTimezone();

    setTimezone(detectedTimezone);

    const updateTime = () => {
      setLocalTime(
        TimezoneService.format(
          new Date(),
          {
            mode: "auto",
            timezone: null,
          },
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      );
    };

    updateTime();

    const interval =
      window.setInterval(
        updateTime,
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  if (!timezone || !localTime) {
    return (
      <div className="text-right">
        <p className="text-xs text-slate-500">
          Local Time
        </p>

        <p className="text-xs text-slate-400">
          Detecting...
        </p>
      </div>
    );
  }

  return (
    <div className="hidden text-right sm:block">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        Local Time
      </p>

      <p className="text-xs font-medium text-slate-300">
        {localTime}
      </p>

      <p className="text-[10px] text-slate-500">
        {timezone}
      </p>
    </div>
  );
}