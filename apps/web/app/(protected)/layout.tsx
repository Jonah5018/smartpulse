import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { ProtectedProviders } from "@/components/providers/protected-providers";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ProtectedProviders>{children}</ProtectedProviders>;
}