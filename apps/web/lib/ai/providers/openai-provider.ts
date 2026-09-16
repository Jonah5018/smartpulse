import OpenAI from "openai";

export class OpenAIProvider {
  static async generate(
    system: string,
    user: string
  ): Promise<string> {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return "AI briefing unavailable.";
    }

    const client = new OpenAI({
      apiKey,
    });

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
