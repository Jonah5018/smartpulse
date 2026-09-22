import Link from "next/link";

import {
  AuthCard,
} from "@/components/auth/auth-card";

import {
  AuthLayout,
} from "@/components/auth/auth-layout";

import {
  BrandLogo,
} from "@/components/auth/brand-logo";

import {
  ResendVerificationForm,
} from "@/components/auth/resend-verification-form";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-8">
          <BrandLogo />

          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold">
              Verify your email
            </h1>

            <p className="text-sm leading-6 text-slate-400">
              We sent a verification link
              to the email address used to
              create your SmartPulse account.
            </p>

            <p className="text-sm leading-6 text-slate-500">
              Open the message and follow
              the verification link before
              signing in.
            </p>
          </div>

          <Link
            href="/login"
            className="block rounded-xl bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-500"
          >
            Continue to sign in
          </Link>

          <div className="border-t border-slate-800 pt-6">
            <p className="mb-4 text-sm text-slate-400">
              Didn&apos;t receive the email?
            </p>

            <ResendVerificationForm />
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}