"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { completeOnboarding } from "@/app/actions/onboarding";

import {
  ExperienceLevel,
  Timeframe,
  OnboardingController,
} from "@/lib/onboarding";

import type { TraderProfileDraft } from "@/lib/profiles";

import {
  AssetClass,
  MarketService,
} from "@/lib/markets";

import {
  WelcomeStep,
  ExperienceStep,
  TradingStyleStep,
  TimeframeStep,
  MarketCategoryStep,
  FavoriteMarketsStep,
  GoalsStep,
  ChallengesStep,
} from "@/components/onboarding";

import { OnboardingHeader } from "./onboarding-header";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingFooter } from "./onboarding-footer";

export function OnboardingShell() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

const [isSaving, setIsSaving] = useState(false);

const [errorMessage, setErrorMessage] =
  useState<string | null>(null);

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

  const step =
    OnboardingController.getStep(currentStep);

  async function next() {
  if (
    OnboardingController.isLastStep(currentStep)
  ) {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      await completeOnboarding(draft);

      router.replace("/dashboard");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "We couldn't finish setting up your account. Please try again."
      );
    } finally {
      setIsSaving(false);
    }

    return;
  }

  setCurrentStep(
    OnboardingController.getNextStep(currentStep)
  );
}

  function previous() {
    setCurrentStep(
      OnboardingController.getPreviousStep(
        currentStep
      )
    );
  }

  function updateExperience(
    value: ExperienceLevel
  ) {
    setDraft((prev) => ({
      ...prev,
      experience_level: value,
    }));
  }

  function updateTradingStyles(
    styles: typeof draft.trading_styles
  ) {
    setDraft((prev) => ({
      ...prev,
      trading_styles: styles,
    }));
  }

  function updatePreferredTimeframes(
    timeframes: Timeframe[]
  ) {
    setDraft((prev) => ({
      ...prev,
      preferred_timeframes: timeframes,
    }));
  }

  function updateMarketCategories(
    categories: AssetClass[]
  ) {
    const allowedSymbols = new Set(
      MarketService.getMarketsByAssetClasses(
        categories
      ).map((market) => market.symbol)
    );

    setDraft((prev) => ({
      ...prev,

      market_categories: categories,

      favorite_markets:
        prev.favorite_markets.filter(
          (symbol: string) =>
            allowedSymbols.has(symbol)
        ),
    }));
  }

  function updateFavoriteMarkets(
    markets: string[]
  ) {
    setDraft((prev) => ({
      ...prev,
      favorite_markets: markets,
    }));
  }

  function updateGoals(
    goals: string[]
  ) {
    setDraft((prev) => ({
      ...prev,
      goals,
    }));
  }

  function updateChallenges(
    challenges: string[]
  ) {
    setDraft((prev) => ({
      ...prev,
      challenges,
    }));
  }

  const canContinue =
    currentStep === 0 ||

    (currentStep === 1 &&
      draft.experience_level !== undefined) ||

    (currentStep === 2 &&
      draft.trading_styles.length > 0) ||

    (currentStep === 3 &&
      draft.preferred_timeframes.length > 0) ||

    (currentStep === 4 &&
      draft.market_categories.length > 0) ||

    (currentStep === 5 &&
      draft.favorite_markets.length > 0) ||

    (currentStep === 6 &&
      draft.goals.length > 0) ||

    (currentStep === 7 &&
      draft.challenges.length > 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1020] via-[#101A36] to-[#111827] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <OnboardingHeader />

        <OnboardingProgress
          progress={OnboardingController.getProgress(
            currentStep
          )}
          title={step.title}
          description={step.description}
        />

        <section className="mt-12 flex-1 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
          {currentStep === 0 && (
            <WelcomeStep onStart={next} />
          )}

          {currentStep === 1 && (
            <ExperienceStep
              value={
                draft.experience_level ?? null
              }
              onChange={updateExperience}
            />
          )}

          {currentStep === 2 && (
            <TradingStyleStep
              value={draft.trading_styles}
              onChange={updateTradingStyles}
            />
          )}

          {currentStep === 3 && (
            <TimeframeStep
              value={
                draft.preferred_timeframes
              }
              onChange={
                updatePreferredTimeframes
              }
            />
          )}

          {currentStep === 4 && (
            <MarketCategoryStep
              value={draft.market_categories}
              onChange={
                updateMarketCategories
              }
            />
          )}

          {currentStep === 5 && (
            <FavoriteMarketsStep
              categories={
                draft.market_categories
              }
              value={
                draft.favorite_markets
              }
              onChange={
                updateFavoriteMarkets
              }
            />
          )}

          {currentStep === 6 && (
            <GoalsStep
              value={draft.goals}
              onChange={updateGoals}
            />
          )}

          {currentStep === 7 && (
            <ChallengesStep
              value={draft.challenges}
              onChange={
                updateChallenges
              }
            />
          )}
        </section>

{errorMessage && (
  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
    {errorMessage}
  </div>
)}
        {currentStep > 0 && (
          <OnboardingFooter
  isFirst={OnboardingController.isFirstStep(
    currentStep
  )}
  isLast={OnboardingController.isLastStep(
    currentStep
  )}
  canContinue={canContinue}
  isLoading={isSaving}
  onNext={next}
  onPrevious={previous}
/>
        )}
      </div>
    </main>
  );
}