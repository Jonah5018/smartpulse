import { ONBOARDING_STEPS } from "./steps";

export class OnboardingController {
  static getSteps() {
    return ONBOARDING_STEPS;
  }

  static getStep(index: number) {
    return ONBOARDING_STEPS[index];
  }

  static getTotalSteps() {
    return ONBOARDING_STEPS.length;
  }

  static isFirstStep(index: number) {
    return index === 0;
  }

  static isLastStep(index: number) {
    return index === ONBOARDING_STEPS.length - 1;
  }

  static getNextStep(index: number) {
    return Math.min(index + 1, ONBOARDING_STEPS.length - 1);
  }

  static getPreviousStep(index: number) {
    return Math.max(index - 1, 0);
  }

  static getProgress(index: number) {
    const totalSteps = ONBOARDING_STEPS.length;

    if (totalSteps <= 1) {
      return 100;
    }

    return (index / (totalSteps - 1)) * 100;
  }
}