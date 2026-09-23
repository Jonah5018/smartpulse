import {
  ReactNode,
} from "react";

import {
  redirect,
} from "next/navigation";

import {
  ProtectedProviders,
} from "@/components/providers/protected-providers";

import {
  LegalAcceptanceRepository,
} from "@/lib/legal/legal-acceptance-repository";

import {
  createClient,
} from "@/lib/supabase/server";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const hasCurrentLegalAcceptance =
    await LegalAcceptanceRepository
      .hasCurrentAcceptance(
        supabase,
        user.id
      );

  if (!hasCurrentLegalAcceptance) {
    redirect("/legal-consent");
  }

  return (
    <ProtectedProviders>
      {children}
    </ProtectedProviders>
  );
}