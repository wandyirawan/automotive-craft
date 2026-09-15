import { ConfigService } from "@nestjs/config";
import { AiProvider } from "./ai-provider.interface";
import { OpenAICompatibleProvider } from "./openai-compatible.provider";

const SUPPORTED_PROVIDERS = ["openrouter", "gemini", "ollama"];

export function createAiProvider(config: ConfigService): AiProvider {
  const provider = config.getOrThrow<string>("AI_PROVIDER");

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error(`Unknown AI provider: ${provider}`);
  }

  return new OpenAICompatibleProvider({
    baseURL: config.getOrThrow<string>("AI_BASE_URL"),
    apiKey: config.getOrThrow<string>("AI_API_KEY"),
    model: config.getOrThrow<string>("AI_MODEL"),
  });
}
