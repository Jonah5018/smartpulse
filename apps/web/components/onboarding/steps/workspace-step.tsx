"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete?: () => void;
}

const TASKS = [
  "Analyzing your trading profile...",
  "Configuring your dashboard...",
  "Personalizing AI insights...",
  "Preparing market watchlists...",
  "Finalizing your SmartPulse workspace...",
];

export function WorkspaceStep({
  onComplete,
}: Props) {
  const [currentTask, setCurrentTask] = useState(0);

  useEffect(() => {
    if (currentTask >= TASKS.length - 1) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1200);

      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentTask((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTask, onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-8 py-16">
      <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

      <div className="space-y-3 text-center">
        <h2 className="text-3xl font-bold">
          Setting up your workspace
        </h2>

        <p className="text-gray-400">
          {TASKS[currentTask]}
        </p>
      </div>

      <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{
            width: `${
              ((currentTask + 1) / TASKS.length) * 100
            }%`,
          }}
        />
      </div>
    </div>
  );
}