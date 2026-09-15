# Architecture Decision Record

Submission for the lmesh Full-Stack Technical Assessment — AI Design Brief Assistant.
Author: Cecep Wandy Irawan

---

## 1. AI integration

AI calls are isolated behind an `AiProvider` interface (`apps/api/src/app/ai/ai-provider.interface.ts`). Available providers are described by configuration (name, baseURL, apiKey, model) loaded from environment variables via `ConfigService`, and a factory (`ai.factory.ts`) builds the active provider at startup — an unknown provider name fails fast at boot instead of silently falling back. The interface was designed streaming-first: it returns `AsyncIterable<string>`, so progressive output never required reworking the contract.

Because the providers in scope (OpenRouter, Gemini, Ollama) all expose OpenAI-compatible APIs, a single adapter built on the OpenAI SDK (`openai-compatible.provider.ts`) covers all of them — switching provider is a config change (`AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` in `.env.example`), not a code change. A provider with a different wire protocol would require one new adapter class implementing the same interface; the factory adds a branch for it, and calling code (chat module) stays untouched.

<!-- TODO(after implementation): 1-2 sentences on how the chat service
     validates/normalises what the provider returns before persisting
     (malformed / empty response handling), with concrete module paths. -->

## 2. Streaming

TODO — answer after the SSE/chat implementation exists.

## 3. Conversation context

The conversation is persisted as a single JSONB column (`conversation`, default `[]`) on the `Project` row (`apps/api/prisma/schema.prisma`, initial migration `20260915163201_init`) instead of a separate `Message` table. Messages are only ever read or written as a whole per project — there is no requirement to query individual messages — so a `Message` table would add a join and a second cascade rule without buying anything.

This also makes deletion semantics trivially correct by construction: deleting a `User` cascades to their `Project` rows (the single FK rule, `onDelete: Cascade`), and every message disappears together with the project row because each message is part of that row. No orphan-message cleanup can exist, and resetting a conversation is a single update to `[]` rather than a bulk delete.

Each stored entry carries `role` (user | assistant), `content`, `createdAt`, and — for assistant messages — a `status` (`COMPLETED` / `PARTIAL` / `ERROR`) so a partially streamed response stays distinguishable after persistence. The trade-off is accepted consciously: individual messages cannot be indexed or queried in SQL, which this use case does not need.

TODO — how the stored history is assembled into the AI request (truncation / limit, if any).

## 4. State management

TODO — answer after the frontend state layout exists.

## 5. What you would do differently

TODO — near the end of the assessment.
