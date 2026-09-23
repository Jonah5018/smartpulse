import Link from "next/link";
import { redirect } from "next/navigation";

import {
  acceptCurrentLegalTerms,
} from "@/app/actions/legal";

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
  LegalAcceptanceRepository,
} from "@/lib/legal/legal-acceptance-repository";

import {
  LEGAL_VERSIONS,
} from "@/lib/legal/versions";

import {
  ProfileRepository,
} from "@/lib/profiles/profile-repository";

import {
  createClient,
} from "@/lib/supabase/server";

interface LegalConsentPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LegalConsentPage({
  searchParams,
}: LegalConsentPageProps) {
  const client =
    await createClient();

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) {
    redirect(
      "/login?returnTo=/legal-consent"
    );
  }

  const alreadyAccepted =
    await LegalAcceptanceRepository
      .hasCurrentAcceptance(
        client,
        user.id
      );

  if (alreadyAccepted) {
    const profile =
      await ProfileRepository.findById(
        client,
        user.id
      );

    redirect(
      profile?.onboarding_completed
        ? "/dashboard"
        : "/onboarding"
    );
  }

  const params =
    await searchParams;

  const errorMessage =
    params.error === "required"
      ? "You must confirm the legal acknowledgement before continuing."
      : params.error ===
          "save_failed"
        ? "We could not record your acknowledgement. Please try again."
        : null;

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-7">
          <BrandLogo />

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-white">
              Before you continue
            </h1>

            <p className="text-sm leading-6 text-slate-400">
              Please review the current
              SmartPulse legal documents
              before accessing the
              platform.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <LegalDocumentLink
              href="/terms"
              label="Terms of Service"
              version={
                LEGAL_VERSIONS.terms
              }
            />

            <LegalDocumentLink
              href="/privacy"
              label="Privacy Policy"
              version={
                LEGAL_VERSIONS.privacy
              }
            />

            <LegalDocumentLink
              href="/risk-disclosure"
              label="Trading Risk Disclosure"
              version={
                LEGAL_VERSIONS
                  .riskDisclosure
              }
            />
          </div>

          <form
            action={
              acceptCurrentLegalTerms
            }
            className="space-y-5"
          >
            <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm leading-6 text-slate-300">
              <input
                type="checkbox"
                name="accepted"
                required
                className="mt-1 size-4 shrink-0"
              />

              <span>
                I confirm that I am at
                least 18 years old,
                agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Terms of Service
                </Link>
                , acknowledge the{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Privacy Policy
                </Link>
                , and confirm that I
                have read the{" "}
                <Link
                  href="/risk-disclosure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Trading Risk Disclosure
                </Link>
                .
              </span>
            </label>

            {errorMessage && (
              <p
                role="alert"
                className="text-sm text-red-400"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Accept and Continue
            </button>
          </form>

          <p className="text-xs leading-5 text-slate-500">
            SmartPulse records the
            versions of these documents
            that you acknowledge so that
            future material changes can
            be presented separately.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

function LegalDocumentLink({
  href,
  label,
  version,
}: {
  href: string;
  label: string;
  version: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        {label}
      </Link>

      <span className="text-xs text-slate-500">
        Version {version}
      </span>
    </div>
  );
}