"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Brain,
  CreditCard,
  Settings,
} from "lucide-react";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Markets", href: "/markets", icon: TrendingUp },
  { name: "Journal", href: "/journal", icon: BookOpen },
{ name: "Pulse Intelligence", href: "/intelligence", icon: Brain },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-blue-600" />

          <div>
            <h2 className="text-lg font-bold">
              SmartPulse
            </h2>

            <p className="text-xs text-slate-400">
              Institutional Intelligence
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                active
                  ? "bg-blue-600/15 text-blue-400 border border-blue-900"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <Icon size={18} />

              <span className="text-sm font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}