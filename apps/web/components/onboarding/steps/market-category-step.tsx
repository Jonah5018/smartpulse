"use client";

import type { AssetClass } from "@/lib/markets";

interface Props {
  value: AssetClass[];
  onChange: (categories: AssetClass[]) => void;
}

const OPTIONS: {
  id: AssetClass;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "forex",
    title: "Forex",
    emoji: "💱",
    description:
      "Currency pairs like EUR/USD and GBP/USD.",
  },
  {
    id: "metal",
    title: "Metals",
    emoji: "🥇",
    description:
      "Gold, Silver and precious metals.",
  },
  {
    id: "index",
    title: "Indices",
    emoji: "📈",
    description:
      "US30, NAS100, GER40 and more.",
  },
  {
    id: "commodity",
    title: "Commodities",
    emoji: "🛢️",
    description:
      "Oil, Gas and agricultural markets.",
  },
  {
    id: "crypto",
    title: "Crypto",
    emoji: "₿",
    description:
      "Bitcoin, Ethereum and digital assets.",
  },
];

export function MarketCategoryStep({
  value,
  onChange,
}: Props) {
  function toggle(category: AssetClass) {
    if (value.includes(category)) {
      onChange(
        value.filter((item) => item !== category)
      );
      return;
    }

    onChange([...value, category]);
  }

  return (
    <div>
      <h2 className="mb-3 text-center text-3xl font-bold">
        Which markets do you trade?
      </h2>

      <p className="mb-8 text-center text-gray-400">
        Select every market that applies.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
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