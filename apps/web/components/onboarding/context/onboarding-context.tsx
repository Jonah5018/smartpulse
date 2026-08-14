"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ExperienceLevel } from "@/lib/onboarding";
import type { TraderProfileDraft } from "@/lib/profiles";

interface OnboardingContextValue {
  currentStep: number;
  draft: TraderProfileDraft;

  setCurrentStep: (step: number) => void;

  setExperienceLevel: (
    level: ExperienceLevel
  ) => void;
}

const OnboardingContext =
  createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const [draft, setDraft] =
    useState<TraderProfileDraft>({
      experience_level: undefined,

      trading_styles: [],

      preferred_timeframes: [],

      market_categories: [],

      favorite_markets: [],

      goals: [],

      challenges: [],

      learning_mode: "learning",
    });

  const value = useMemo(
    () => ({
      currentStep,
      draft,

      setCurrentStep,

      setExperienceLevel(
        level: ExperienceLevel
      ) {
        setDraft((previous) => ({
          ...previous,
          experience_level: level,
        }));
      },
    }),
    [currentStep, draft]
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      "useOnboarding must be used inside OnboardingProvider."
    );
  }

  return context;
}