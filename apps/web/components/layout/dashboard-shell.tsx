import { ReactNode } from "react";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

import type { TraderProfile } from "@/lib/profiles";

interface DashboardShellProps {
  children: ReactNode;
  profile: TraderProfile;
}

export function DashboardShell({
  children,
  profile,
}: DashboardShellProps) {
  return (
    <div className="sp-workspace flex min-h-screen bg-slate-950 text-slate-100">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader profile={profile} />

        <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 [overflow-wrap:anywhere] p-4 sm:p-7 xl:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
