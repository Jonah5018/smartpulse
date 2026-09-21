import type { ReactNode } from "react";
export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-2xl"><p className="sp-eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{description}</p></div>{actions && <div className="flex flex-wrap gap-3">{actions}</div>}</div>;
}
