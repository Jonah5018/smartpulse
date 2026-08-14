export interface BehaviourProfile {
  averageHoldMinutes: number;

  averageTradesPerWeek: number;

  preferredTradingSession: string;

  consistencyScore: number;
}

export interface PerformanceProfile {
  winRate: number;

  averageRiskReward: number;

  averageReturnPercent: number;

  strongestMarket: string;

  weakestMarket: string;
}

export interface LearningProfile {
  experienceScore: number;

  adaptationScore: number;

  disciplineScore: number;
}

export interface TraderDNA {
  behaviour: BehaviourProfile;

  performance: PerformanceProfile;

  learning: LearningProfile;
}