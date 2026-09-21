import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { MarketSessionService } from "@/lib/market-session";
import { TimezoneDisplay } from "./timezone-display";
import { MobileNavigation } from "./mobile-navigation";
import type { TraderProfile } from "@/lib/profiles";

export function AppHeader({ profile }: { profile: TraderProfile }) {
  const initials = ((profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")).toUpperCase();
  const session = MarketSessionService.current();
  return (
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 xl:min-h-16">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNavigation />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-blue-500 sm:text-xs">Market Status</p>
          <p className="text-sm font-semibold sm:text-base">{session.isOpen ? "Active Session" : "Markets Closed"}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="hidden md:block"><TimezoneDisplay timezone={profile.timezone} /></div>
        <NotificationsMenu />
        <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold sm:size-10">{initials}</div>
      </div>
      <div className="flex w-full min-w-0 items-center justify-between gap-3 border-t border-slate-800 pt-2 xl:w-auto xl:border-0 xl:pt-0">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium">{profile.full_name}</p>
          <p className="text-xs capitalize text-slate-400">{profile.learning_mode}</p>
        </div>
        <div className="shrink-0"><LogoutButton /></div>
      </div>
    </header>
  );
}
