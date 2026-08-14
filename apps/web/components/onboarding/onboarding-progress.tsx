interface Props {
  progress: number;
  title: string;
  description: string;
}

export function OnboardingProgress({
  progress,
  title,
  description,
}: Props) {
  return (
    <div className="mt-12">

      <div className="mb-4 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-semibold">
            {title}
          </h2>

          <p className="text-gray-400">
            {description}
          </p>

        </div>

        <span className="text-sm text-gray-400">
          {Math.round(progress)}%
        </span>

      </div>

      <div className="h-2 rounded-full bg-white/10">

        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

      </div>

    </div>
  );
}