import { Timeframe } from "@/lib/onboarding";

interface Props {
  value: Timeframe[];
  onChange: (timeframes: Timeframe[]) => void;
}

const OPTIONS: {
  id: Timeframe;
  title: string;
  description: string;
}[] = [
  {
    id: "M1",
    title: "M1",
    description: "1 Minute",
  },
  {
    id: "M5",
    title: "M5",
    description: "5 Minutes",
  },
  {
    id: "M15",
    title: "M15",
    description: "15 Minutes",
  },
  {
    id: "M30",
    title: "M30",
    description: "30 Minutes",
  },
  {
    id: "H1",
    title: "H1",
    description: "1 Hour",
  },
  {
    id: "H4",
    title: "H4",
    description: "4 Hours",
  },
  {
    id: "D1",
    title: "D1",
    description: "Daily",
  },
  {
    id: "W1",
    title: "W1",
    description: "Weekly",
  },
];

export function TimeframeStep({
  value,
  onChange,
}: Props) {
  function toggle(timeframe: Timeframe) {
    if (value.includes(timeframe)) {
      onChange(value.filter((t) => t !== timeframe));
    } else {
      onChange([...value, timeframe]);
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-center text-3xl font-bold">
        Which timeframes do you trade most?
      </h2>

      <p className="mb-8 text-center text-gray-400">
        Select all that apply.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {OPTIONS.map((option) => {
          const selected = value.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-2xl border p-6 text-center transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
                  : "border-white/10 bg-white/5 hover:border-blue-400"
              }`}
            >
              <h3 className="text-3xl font-bold">
                {option.title}
              </h3>

              <p className="mt-3 text-sm text-gray-400">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}