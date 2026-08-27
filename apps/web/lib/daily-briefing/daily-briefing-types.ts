export interface BriefingSection {
  title: string;
  content: string;
}

export interface DailyBriefing {
  generatedAt: string;

  greeting: string;

  focusScore: number | null;

  marketSummary: BriefingSection;

  mission: BriefingSection;

  opportunity: BriefingSection;

  risk: BriefingSection;

  growth: BriefingSection;

  economicEvents: BriefingSection;

  closing: string;
}