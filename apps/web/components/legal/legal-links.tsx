import Link from "next/link";

interface LegalLinksProps {
  className?: string;
}

export function LegalLinks({
  className = "",
}: LegalLinksProps) {
  return (
    <nav
      aria-label="Legal information"
      className={`flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500 ${className}`}
    >
      <Link
        href="/privacy"
        className="transition hover:text-slate-300"
      >
        Privacy Policy
      </Link>

      <Link
        href="/terms"
        className="transition hover:text-slate-300"
      >
        Terms of Service
      </Link>

      <Link
        href="/risk-disclosure"
        className="transition hover:text-slate-300"
      >
        Risk Disclosure
      </Link>
    </nav>
  );
}