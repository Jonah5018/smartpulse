"use client";

import { ReactNode } from "react";
import { SessionManager } from "@/components/auth/session-manager";

interface ProtectedProvidersProps {
  children: ReactNode;
}

export function ProtectedProviders({
  children,
}: ProtectedProvidersProps) {
  return (
    <>
      <SessionManager />
      {children}
    </>
  );
}