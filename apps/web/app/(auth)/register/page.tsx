import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandLogo } from "@/components/auth/brand-logo";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-8">
          <BrandLogo />

          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-semibold">
              Create Your SmartPulse Account
            </h2>

            <p className="text-sm text-slate-400">
              Start your free 5-day trial and gain access
              to institutional-grade market intelligence.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="space-y-2 text-sm text-slate-300">
              <p>✓ 5-Day Free Trial</p>
              <p>✓ AI Market Narratives</p>
              <p>✓ Trading Journal</p>
              <p>✓ Trading IQ Analytics</p>
            </div>
          </div>

          <RegisterForm />

          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-2 block text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}