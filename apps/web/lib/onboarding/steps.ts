import type { OnboardingStep } from "./types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    key: "welcome",
    title: "Welcome",
    description: "Let's personalize your workspace.",
  },
  {
    id: 2,
    key: "experience",
    title: "Experience",
    description: "Tell us about your trading experience.",
  },
  {
    id: 3,
    key: "styles",
    title: "Trading Style",
    description: "Select every style that applies.",
  },
  {
    id: 4,
    key: "timeframes",
    title: "Timeframes",
    description: "Choose the charts you use most.",
  },
  {
    id: 5,
    key: "markets",
    title: "Markets",
    description: "Pick your favorite markets.",
  },
  {
    id: 6,
    key: "goals",
    title: "Goals",
    description: "What do you want SmartPulse to help you achieve?",
  },
  {
    id: 7,
    key: "challenges",
    title: "Challenges",
    description: "What are your biggest trading challenges?",
  },
  {
    id: 8,
    key: "workspace",
    title: "Workspace",
    description: "Preparing your personalized workspace.",
  },
];