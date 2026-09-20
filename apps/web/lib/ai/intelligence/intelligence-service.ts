import type {
  InstitutionalSetup,
} from "@/lib/institutional-setup";

import {
  AIContextBuilder,
} from "./context-builder";

import {
  PromptBuilder,
} from "./prompt-builder";

import {
  OpenAIProvider,
} from "../providers";

import { AnalysisCache } from "@/lib/analysis-cache/analysis-cache";

export class AIIntelligenceService {
  static createPrompt(
    setup: InstitutionalSetup,
    macroAnalysis: Parameters<typeof AIContextBuilder.build>[1]
  ) {
    const context =
      AIContextBuilder.build(
        setup,
        macroAnalysis
      );

    return PromptBuilder.build(
      context
    );
  }

  static async generateBrief(
    setup: InstitutionalSetup,
    macroAnalysis: Parameters<typeof AIContextBuilder.build>[1]
  ) {
    const prompt =
      this.createPrompt(setup, macroAnalysis);

    const key = `ai-brief:${setup.symbol}:${setup.timeframe}`;
    const signature = JSON.stringify(prompt);
    const cached = AnalysisCache.get<{ signature: string; brief: string }>(key);
    if (cached?.signature === signature) return cached.brief;

    const brief = await OpenAIProvider.generate(
      prompt.system,
      prompt.user
    );
    if (brief) AnalysisCache.set(key, { signature, brief }, 60);
    return brief;
  }
}
