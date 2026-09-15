import OpenAI from "openai";
import {
  AiMessage,
  AiProvider,
  OpenAICompatibleConfig,
} from "./ai-provider.interface";

export class OpenAICompatibleProvider implements AiProvider {
  private readonly client: OpenAI;

  constructor(private readonly config: OpenAICompatibleConfig) {
    this.client = new OpenAI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
    });
  }

  async chat(messages: AiMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
