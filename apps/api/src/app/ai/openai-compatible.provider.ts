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

  async *chat(messages: AiMessage[]): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        yield content;
      }
    }
  }
}
