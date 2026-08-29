import type { InstitutionalSetup } from "@/lib/institutional-setup";

type TimelineStepColor = "blue" | "purple" | "teal" | "green";

type TimelineStep = {
  title: string;
  subtitle: string;
  active: boolean;
  color: TimelineStepColor;
};

interface Props {
  setup: InstitutionalSetup;
}

export function MarketStructureTimeline({
  setup,
}: Props) {
  const steps: TimelineStep[] = [
    {
      title: setup.structureEvent.toUpperCase(),
      subtitle: "Structure",
      active: setup.structureEvent !== "none",
      color: "blue",
    },
    {
      title: setup.liquidity.latestSweep
        ? "SWEEP"
        : "WAIT",
      subtitle: "Liquidity",
      active:
        setup.liquidity.latestSweep !== null,
      color: "purple",
    },
    {
      title: setup.entryZone ? "FVG" : "NONE",
      subtitle: "Imbalance",
      active: setup.entryZone !== null,
      color: "teal",
    },
    {
      title:
        setup.state === "ready"
          ? "READY"
          : setup.state === "forming"
          ? "FORMING"
          : "WAIT",
      subtitle: "Execution",
      active: setup.state === "ready",
      color: "green",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-400">
          Institutional Story
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Market Structure Timeline
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <TimelineNode
            key={index}
            {...step}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Sequence
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {setup.explanation}
        </p>
      </div>
    </section>
  );
}

function TimelineNode({
  title,
  subtitle,
  active,
  color,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  color:
    | "blue"
    | "purple"
    | "teal"
    | "green";
}) {
  const palette = {
    blue: active
      ? "bg-blue-500 text-white"
      : "bg-slate-800 text-slate-500",

    purple: active
      ? "bg-purple-500 text-white"
      : "bg-slate-800 text-slate-500",

    teal: active
      ? "bg-teal-500 text-white"
      : "bg-slate-800 text-slate-500",

    green: active
      ? "bg-emerald-500 text-white"
      : "bg-slate-800 text-slate-500",
  };

  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold ${palette[color]}`}
      >
        {title}
      </div>

      <p className="mt-3 text-xs text-slate-300">
        {subtitle}
      </p>
    </div>
  );
}