import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandLogo } from "@/components/auth/brand-logo";

import { ResetPasswordForm } from "@/components/auth/password-reset/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-8">
          <BrandLogo />

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              Create New Password
            </h2>

            <p className="text-sm text-slate-400">
              Choose a strong password for your
              SmartPulse account.
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}