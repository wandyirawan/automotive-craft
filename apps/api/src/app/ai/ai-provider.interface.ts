export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiProvider {
  chat(messages: AiMessage[]): AsyncIterable<string>;
}

export interface OpenAICompatibleConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}
