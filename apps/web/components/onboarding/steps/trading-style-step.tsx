import { TradingStyle } from "@/lib/onboarding";

interface Props {
  value: TradingStyle[];
  onChange: (styles: TradingStyle[]) => void;
}

const OPTIONS: {
  id: TradingStyle;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "scalping",
    emoji: "⚡",
    title: "Scalping",
    description: "Very short-term trades lasting seconds or minutes.",
  },
  {
    id: "day",
    emoji: "📅",
    title: "Day Trading",
    description: "Open and close trades within the same trading day.",
  },
  {
    id: "swing",
    emoji: "🌊",
    title: "Swing Trading",
    description: "Hold trades for several days to capture market swings.",
  },
  {
    id: "position",
    emoji: "🏔️",
    title: "Position Trading",
    description: "Long-term trades based on broader market trends.",
  },
];

export function TradingStyleStep({
  value,
  onChange,
}: Props) {
  function toggle(style: TradingStyle) {
    if (value.includes(style)) {
      onChange(value.filter((s) => s !== style));
    } else {
      onChange([...value, style]);
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-center text-3xl font-bold">
        Which trading styles describe you?
      </h2>

      <p className="mb-8 text-center text-gray-400">
        Select all that apply.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              className={`rounded-2xl border p-6 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
                  : "border-white/10 bg-white/5 hover:border-blue-400"
              }`}
            >
              <div className="text-4xl">
                {option.emoji}
              </div>

              <h3 className="mt-4 text-xl font-semibold">
                {option.title}
              </h3>

              <p className="mt-2 text-gray-400">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}