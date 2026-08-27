import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIProvider {
  static async generate(
    system: string,
    user: string
  ): Promise<string> {
    const response =
      await client.responses.create({
        model: "gpt-5",

        input: [
          {
            role: "system",
            content: system,
          },
          {
            role: "user",
            content: user,
          },
        ],
      });

    return (
      response.output_text ??
      "AI briefing unavailable."
    );
  }
}