import Link from "next/link";
import { Bell } from "lucide-react";
export function NotificationsMenu() {
  return (
    <details className="relative">
      <summary
        aria-label="Notifications"
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-blue-400 [&::-webkit-details-marker]:hidden"
      >
        <Bell size={17} />
      </summary>
      <div className="absolute right-0 top-12 z-40 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <h2 className="text-sm font-semibold">Notifications</h2>
        <p className="mt-2 text-xs leading-6 text-slate-400">
          View your market-state changes and configure the markets you follow.
        </p>
        <Link
          href="/alerts"
          className="mt-3 inline-block text-xs text-teal-300"
        >
          Open market alerts →
        </Link>
      </div>
    </details>
  );
}
