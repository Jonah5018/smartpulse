import {
  NotificationsMenu,
} from "./notifications-menu";

import {
  ThemeToggle,
} from "@/components/dashboard/theme-toggle";

import {
  LogoutButton,
} from "@/components/auth/logout-button";

import {
  MarketSessionService,
} from "@/lib/market-session";

import {
  TimezoneDisplay,
} from "./timezone-display";

import {
  MobileNavigation,
} from "./mobile-navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getEffectiveEntitlement,
} from "@/lib/billing/entitlement";

import type {
  TraderProfile,
} from "@/lib/profiles";

function daysRemaining(
  endDate: string | null
): number | null {
  if (!endDate) {
    return null;
  }

  const end =
    new Date(endDate).getTime();

  if (!Number.isFinite(end)) {
    return null;
  }

  const difference =
    end - Date.now();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

function capitalize(
  value: string
): string {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

export async function AppHeader({
  profile,
}: {
  profile: TraderProfile;
}) {
  const initials =
    (
      (profile.first_name?.[0] ??
        "") +
      (profile.last_name?.[0] ??
        "")
    ).toUpperCase();

  const session =
    MarketSessionService.current();

  const client =
    await createClient();

  const entitlement =
    await getEffectiveEntitlement(
      client
    );

  let planLabel =
    "No active plan";

  let planDetail:
    string | null =
    null;

  if (
    entitlement.trialActive &&
    entitlement.effectivePlan !==
      "none"
  ) {
    const remaining =
      daysRemaining(
        entitlement.trialEndsAt
      );

    planLabel =
      `${capitalize(
        entitlement.effectivePlan
      )} trial`;

    if (remaining !== null) {
      planDetail =
        remaining === 1
          ? "1 day left"
          : `${remaining} days left`;
    }
  } else if (
    entitlement.hasPaidAccess &&
    entitlement.effectivePlan !==
      "none"
  ) {
    planLabel =
      `${capitalize(
        entitlement.effectivePlan
      )} plan`;
  } else if (
    entitlement.trialExpired
  ) {
    planLabel =
      "Trial expired";
  }

  return (
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 xl:min-h-16">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation />

        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-500 sm:text-xs">
            Market Status
          </p>

          <p className="text-sm font-semibold sm:text-base">
            {session.isOpen
              ? "Active Session"
              : "Markets Closed"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300">
            {planLabel}
          </p>

          {planDetail && (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {planDetail}
            </p>
          )}
        </div>

        <ThemeToggle />

        <div className="hidden md:block">
          <TimezoneDisplay
            timezone={
              profile.timezone
            }
          />
        </div>

        <NotificationsMenu />

        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold sm:size-10"
        >
          {initials}
        </div>
      </div>

      <div className="flex w-full min-w-0 items-center justify-between gap-3 border-t border-slate-800 pt-2 xl:w-auto xl:border-0 xl:pt-0">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium">
            {profile.full_name}
          </p>

          <p className="text-xs capitalize text-slate-400">
            {profile.learning_mode}
          </p>
        </div>

        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
