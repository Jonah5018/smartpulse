import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandLogo } from "@/components/auth/brand-logo";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-8">
          <BrandLogo />

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              Welcome Back
            </h2>

            <p className="text-sm text-slate-400">
              Sign in to access your institutional trading desk.
            </p>
          </div>

          <LoginForm />

          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-400">
              New to SmartPulse?
            </p>

            <Link
              href="/register"
              className="mt-2 block text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Create your SmartPulse account →
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}