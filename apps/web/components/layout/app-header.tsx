import { Bell } from "lucide-react";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { TimezoneDisplay } from "./timezone-display";

import type { TraderProfile } from "@/lib/profiles";

interface AppHeaderProps {
  profile: TraderProfile;
}

export function AppHeader({
  profile,
}: AppHeaderProps) {
  const initials = `${profile.first_name[0]}${profile.last_name[0]}`
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-500">
          Market Status
        </p>

        <h1 className="font-semibold">
          Active Session
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <TimezoneDisplay />
        
        <button className="rounded-lg border border-slate-800 p-2 hover:bg-slate-900">
          <Bell size={18} />
        </button>

        <LogoutButton />

        <div className="text-right">
          <p className="text-sm font-medium">
            {profile.full_name}
          </p>

          <p className="text-xs text-slate-400 capitalize">
            {profile.learning_mode}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}