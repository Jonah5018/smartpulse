import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandLogo } from "@/components/auth/brand-logo";

import { ForgotPasswordForm } from "@/components/auth/password-reset/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-8">
          <BrandLogo />

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">
              Reset Password
            </h2>

            <p className="text-sm text-slate-400">
              Enter your email address and we&apos;ll
              send reset instructions.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
