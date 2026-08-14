import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e40af22,transparent_45%)]" />

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}