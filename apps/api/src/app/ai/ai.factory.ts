import { ConfigService } from "@nestjs/config";

import { AiConfigurationException } from "../common/exceptions/ai-configuration.exception";
import { AiProvider } from "./ai-provider.interface";
import { OpenAICompatibleProvider } from "./openai-compatible.provider";

export const AI_PROVIDER = Symbol("AI_PROVIDER");

const SUPPORTED_PROVIDERS = new Set(["openrouter", "gemini", "ollama"]);

/**
 * Creates the configured AI provider.
 *
 * @param config - Application configuration service.
 * @returns The configured AI provider.
 * @throws AiConfigurationException When required AI configuration is missing
 * or the configured provider is unsupported.
 */
export function createAiProvider(config: ConfigService): AiProvider {
  const provider = config.get<string>("AI_PROVIDER");
  const baseURL = config.get<string>("AI_BASE_URL");
  const apiKey = config.get<string>("AI_API_KEY");
  const model = config.get<string>("AI_MODEL");

  const missing: string[] = [];

  if (!provider) missing.push("AI_PROVIDER");
  if (!baseURL) missing.push("AI_BASE_URL");
  if (!apiKey) missing.push("AI_API_KEY");
  if (!model) missing.push("AI_MODEL");

  if (missing.length > 0) {
    throw new AiConfigurationException(
      `Missing AI configuration: ${missing.join(", ")}`,
    );
  }

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new AiConfigurationException(`Unknown AI provider: ${provider}`);
  }

  return new OpenAICompatibleProvider({
    baseURL,
    apiKey,
    model,
  });
}
