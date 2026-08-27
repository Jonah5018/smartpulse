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

    return OpenAIProvider.generate(
      prompt.system,
      prompt.user
    );
  }
}