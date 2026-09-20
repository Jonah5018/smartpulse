import OpenAI from "openai";

export class OpenAIProvider {
  static async generate(
    system: string,
    user: string
  ): Promise<string | null> {
    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return null;
    }

    const client = new OpenAI({
      apiKey,
      timeout: 20_000,
      maxRetries: 0,
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
      response.output_text?.trim() || null
    );
  }
}
