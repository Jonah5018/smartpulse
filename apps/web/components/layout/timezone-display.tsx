"use client";

import { useSyncExternalStore } from "react";

import {
  TimezoneService,
} from "@/lib/timezone";

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 1000);
  return () => window.clearInterval(interval);
}

function getLocalTime() {
  return TimezoneService.format(new Date());
}

function getServerTime() {
  return null;
}

export function TimezoneDisplay() {
  const localTime = useSyncExternalStore(subscribeToClock, getLocalTime, getServerTime);
  const timezone = localTime ? TimezoneService.detectBrowserTimezone() : null;

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
