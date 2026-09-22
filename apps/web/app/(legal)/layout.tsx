import Link from "next/link";
import type { ReactNode } from "react";

import { LegalLinks } from "@/components/legal/legal-links";

export default function LegalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link
            href="/login"
            className="font-semibold tracking-tight"
          >
            SmartPulse
          </Link>

          <Link
            href="/login"
            className="text-sm text-blue-400 transition hover:text-blue-300"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-slate-800/80 px-5 py-8">
        <LegalLinks />

        <p className="mt-4 text-center text-xs text-slate-600">
          SmartPulse is operated by Jonathan Uchenna Nwofoke,
          Nigeria.
        </p>
      </footer>
    </div>
  );
}