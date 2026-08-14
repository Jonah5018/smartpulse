"use client";

const CHALLENGES = [
  "Overtrading",
  "Poor risk management",
  "Emotional trading",
  "Lack of discipline",
  "Missing good trade setups",
  "Inconsistent profitability",
  "Poor trade entries",
  "Poor trade exits",
  "Lack of confidence",
  "No trading plan",
];

interface Props {
  value: string[];
  onChange: (challenges: string[]) => void;
}

export function ChallengesStep({
  value,
  onChange,
}: Props) {
  function toggle(challenge: string) {
    if (value.includes(challenge)) {
      onChange(
        value.filter((item) => item !== challenge)
      );
      return;
    }

    onChange([...value, challenge]);
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">
          Biggest Trading Challenges
        </h2>

        <p className="mt-3 text-gray-400">
          Select the areas where you struggle
          the most.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CHALLENGES.map((challenge) => {
          const selected =
            value.includes(challenge);

          return (
            <button
              key={challenge}
              type="button"
              onClick={() =>
                toggle(challenge)
              }
              className={`rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
                  : "border-white/10 bg-white/5 hover:border-blue-400"
              }`}
            >
              {challenge}
            </button>
          );
        })}
      </div>
    </div>
  );
}