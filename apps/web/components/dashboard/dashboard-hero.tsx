"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  SessionStatus,
} from "@/lib/market-session";

type DashboardHeroProps = {
  profile: {
    first_name?: string | null;
  };

  session: SessionStatus;
};

function getGreeting(
  date: Date
) {
  const hour =
    date.getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  if (hour < 21) {
    return "Good Evening";
  }

  return "Welcome Back";
}

function getSessionPresentation(
  session: SessionStatus
) {
  if (!session.isOpen) {
    return {
      label: "Markets Closed",

      color:
        "text-slate-400",
    };
  }

  switch (session.current) {
    case "sydney":
      return {
        label:
          "Sydney Session Active",

        color:
          "text-yellow-500",
      };

    case "tokyo":
      return {
        label:
          "Tokyo Session Active",

        color:
          "text-yellow-500",
      };

    case "london":
      return {
        label:
          "London Session Active",

        color:
          "text-green-500",
      };

    case "new_york":
      return {
        label:
          "New York Session Active",

        color:
          "text-blue-500",
      };

    default:
      return {
        label:
          "Markets Closed",

        color:
          "text-slate-400",
      };
  }
}

export function DashboardHero({
  profile,
  session,
}: DashboardHeroProps) {
  const [time, setTime] =
    useState("");

  const [greeting, setGreeting] =
    useState("");

  useEffect(() => {
    const updateClock = () => {
      const now =
        new Date();

      setGreeting(
        getGreeting(now)
      );

      setTime(
        now.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      );
    };

    updateClock();

    const interval =
      setInterval(
        updateClock,
        60000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  const sessionPresentation =
    getSessionPresentation(
      session
    );

  return (
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-blue-500">
            SmartPulse Intelligence Desk
          </p>

          <h1 className="mt-4 text-5xl font-bold">
            {greeting},{" "}
            {profile.first_name?.trim() ||
              "Trader"}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Institutional market intelligence designed to help retail traders
            think like professionals.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm text-slate-400">
            Local Time
          </p>

          <p className="mt-2 text-3xl font-bold">
            {time || "--:--"}
          </p>

          <p
            className={`mt-2 ${sessionPresentation.color}`}
          >
            {sessionPresentation.label}
          </p>
        </div>
      </div>
    </section>
  );
}