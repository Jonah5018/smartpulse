import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-xl">
      <CardContent className="p-8">
        {children}
      </CardContent>
    </Card>
  );
}