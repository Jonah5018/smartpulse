import Link from "next/link";
import { requireTrader } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeading } from "@/components/workspace/page-heading";
import { SettingsForm } from "@/components/workspace/settings-form";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export default async function SettingsPage() {
  const { profile, user } = await requireTrader();
  return <DashboardShell profile={profile}><div className="mx-auto max-w-5xl space-y-7"><PageHeading eyebrow="Your workspace" title="Settings" description="Manage your profile and the preferences that shape your SmartPulse experience." /><SettingsForm profile={{ first_name: profile.first_name, last_name: profile.last_name, timezone: profile.timezone, learning_mode: profile.learning_mode }} /><div className="grid gap-5 md:grid-cols-2"><section className="sp-panel"><h2 className="font-semibold">Account</h2><p className="mt-3 break-all text-sm text-slate-400">{user.email}</p><p className="mt-2 text-xs text-slate-500">Your sign-in email is managed through authentication.</p><Link href="/billing" className="mt-5 inline-block text-sm text-blue-400 hover:text-blue-300">View billing information →</Link></section><section className="sp-panel"><h2 className="font-semibold">Market preferences</h2><p className="mt-3 text-sm leading-6 text-slate-400">Choose your priority markets. SmartPulse can still surface opportunities outside your watchlist.</p><Link href="/watchlist" className="mt-5 inline-block text-sm text-blue-400 hover:text-blue-300">Manage watchlist →</Link></section><section className="sp-panel flex items-center justify-between gap-4"><div><h2 className="font-semibold">Appearance</h2><p className="mt-2 text-sm text-slate-400">Change your saved color-theme preference.</p></div><ThemeToggle /></section></div></div></DashboardShell>;
}

<section className="sp-panel">
  <h2 className="font-semibold">
    Privacy & Data
  </h2>

  <p className="mt-3 text-sm leading-6 text-slate-400">
    Review how SmartPulse handles
    your information or request
    access, correction, export, or
    deletion of your account data.
  </p>

  <div className="mt-5 flex flex-wrap gap-4 text-sm">
    <Link
      href="/privacy"
      className="text-blue-400 hover:text-blue-300"
    >
      Privacy Policy →
    </Link>

    <Link
      href="/terms"
      className="text-blue-400 hover:text-blue-300"
    >
      Terms →
    </Link>

    <Link
      href="/risk-disclosure"
      className="text-blue-400 hover:text-blue-300"
    >
      Risk Disclosure →
    </Link>
  </div>

  <p className="mt-5 text-xs leading-5 text-slate-500">
    Self-service data export and
    account deletion are being
    prepared for production.
    Until then, privacy requests
    can be sent to
    jonahsmith5018@gmail.com.
  </p>
</section>