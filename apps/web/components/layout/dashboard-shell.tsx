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
    <div className="flex min-h-screen bg-slate-950">
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <AppHeader profile={profile} />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}