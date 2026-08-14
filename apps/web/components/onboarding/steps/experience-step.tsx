import { ExperienceLevel } from "@/lib/onboarding";

interface Props {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel) => void;
}

const OPTIONS: {
  id: ExperienceLevel;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    id: "beginner",
    emoji: "🌱",
    title: "I'm new to trading",
    description: "I'm learning the fundamentals.",
  },
  {
    id: "intermediate",
    emoji: "📈",
    title: "I know the basics",
    description: "I'm building consistency.",
  },
  {
    id: "advanced",
    emoji: "🧠",
    title: "I trade confidently",
    description: "I have solid experience.",
  },
  {
    id: "professional",
    emoji: "🏛️",
    title: "I trade professionally",
    description: "I use advanced strategies.",
  },
];

export function ExperienceStep({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <h2 className="mb-8 text-center text-3xl font-bold">
        Which best describes you today?
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`rounded-2xl border p-6 text-left transition-all ${
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