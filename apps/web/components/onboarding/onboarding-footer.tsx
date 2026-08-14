interface Props {
  isFirst: boolean;
  isLast: boolean;
  canContinue: boolean;
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function OnboardingFooter({
  isFirst,
  isLast,
  canContinue,
  isLoading,
  onNext,
  onPrevious,
}: Props) {
  return (
    <footer className="mt-8 flex justify-between">
      <button
        type="button"
        disabled={isFirst || isLoading}
        onClick={onPrevious}
        className="rounded-xl border border-white/20 px-6 py-3 transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        Back
      </button>

      <button
        type="button"
        disabled={!canContinue || isLoading}
        onClick={onNext}
        className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Preparing your workspace..."
          : isLast
            ? "Finish"
            : "Continue"}
      </button>
    </footer>
  );
}