interface Props {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: Props) {
  return (
    <div className="mx-auto max-w-xl text-center">

      <h2 className="text-4xl font-bold">
        Welcome to SmartPulse 👋
      </h2>

      <p className="mt-5 text-lg text-gray-300">
        We&apos;ll personalize your workspace based on how you trade,
        what you want to achieve, and how you&apos;d like to learn.
      </p>

      <div className="mt-10 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">

        <p>✅ Personalized dashboard</p>

        <p>✅ Tailored Pulse Intelligence</p>

        <p>✅ Learning mode adapted to you</p>

        <p>✅ Favorite markets & watchlists</p>

      </div>

      <button
        onClick={onStart}
        className="mt-10 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold hover:bg-blue-500"
      >
        Get Started
      </button>

    </div>
  );
}
