"use client";

const GOALS = [
  "Become consistently profitable",
  "Improve risk management",
  "Increase win rate",
  "Reduce emotional trading",
  "Build a trading journal",
  "Receive AI trade ideas",
  "Get better market alerts",
  "Pass a prop firm challenge",
];

interface Props {
  value: string[];
  onChange: (goals: string[]) => void;
}

export function GoalsStep({
  value,
  onChange,
}: Props) {
  function toggle(goal: string) {
    if (value.includes(goal)) {
      onChange(value.filter((g) => g !== goal));
      return;
    }

    onChange([...value, goal]);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">
          Your Trading Goals
        </h2>

        <p className="mt-3 text-gray-400">
          Select everything you want SmartPulse
          to help you achieve.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GOALS.map((goal) => {
          const selected = value.includes(goal);

          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggle(goal)}
              className={`rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
                  : "border-white/10 bg-white/5 hover:border-blue-400"
              }`}
            >
              {goal}
            </button>
          );
        })}
      </div>
    </div>
  );
}