"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  TrendingUp,
  Star,
  BookOpen,
  Brain,
  CreditCard,
  Settings,
} from "lucide-react";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },

  {
    name: "Markets",
    href: "/markets",
    icon: TrendingUp,
  },

  {
    name: "Watchlist",
    href: "/watchlist",
    icon: Star,
  },

  {
    name: "Journal",
    href: "/journal",
    icon: BookOpen,
  },

  {
    name: "Pulse Intelligence",
    href: "/intelligence",
    icon: Brain,
  },

  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },

  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];


export function AppNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(
              `${item.href}/`
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "border border-blue-900 bg-blue-600/15 text-blue-400"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />

              <span className="text-sm font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>);
}

export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-800/80 bg-slate-950 lg:flex">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-600" />
          <div>
            <h2 className="text-lg font-bold">SmartPulse</h2>
            <p className="mt-1 text-xs text-slate-500">Your trading workspace</p>
          </div>
        </div>
      </div>
      <AppNavigation />
      <div className="m-4 rounded-xl border border-slate-800/70 bg-slate-900/40 p-4"><p className="text-xs font-medium text-slate-300">Process over prediction</p><p className="mt-2 text-xs leading-5 text-slate-500">Research with intention.<br />Review every decision.</p></div>
    </aside>
  );
}
