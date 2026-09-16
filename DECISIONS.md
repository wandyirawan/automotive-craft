# Architecture Decision Record

Submission for the lmesh Full-Stack Technical Assessment — AI Design Brief Assistant.
Author: Cecep Wandy Irawan

---

## 1. AI integration

AI calls are isolated behind an `AiProvider` interface (`apps/api/src/app/ai/ai-provider.interface.ts`). Available providers are described by configuration (name, baseURL, apiKey, model) loaded from environment variables via `ConfigService`, and a factory (`ai.factory.ts`) builds the active provider at startup — an unknown provider name fails fast at boot instead of silently falling back. The interface was designed streaming-first: it returns `AsyncIterable<string>`, so progressive output never required reworking the contract.

Because the providers in scope (OpenRouter, Gemini, Ollama) all expose OpenAI-compatible APIs, a single adapter built on the OpenAI SDK (`openai-compatible.provider.ts`) covers all of them — switching provider is a config change (`AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` in `.env.example`), not a code change. A provider with a different wire protocol would require one new adapter class implementing the same interface; the factory adds a branch for it, and calling code (chat module) stays untouched.

Before persisting a reply, the chat service discards empty or malformed chunks from the provider stream and treats a stream that ends with no content as an `ERROR` status rather than a blank `COMPLETED` message. (The chat service is not yet implemented; this describes the intended validation path.)

## 2. Streaming

The AI contract is streaming-first: `AiProvider` returns `AsyncIterable<string>`, so the backend can forward tokens to the client as they arrive instead of buffering a full response. The intended transport to the browser is Server-Sent Events (SSE): the (planned) chat endpoint calls the active provider, iterates the async stream, and writes each chunk to the SSE response; the frontend appends tokens to its in-progress conversation state (see §4). Partial responses are represented with a per-message `status` of `PARTIAL` while the stream is open, then flipped to `COMPLETED` (or `ERROR` on failure) when it closes. Note: the chat endpoint itself is not yet implemented — this section describes the designed streaming path, not a shipped one.

## 3. Conversation context

The conversation is persisted as a single JSONB column (`conversation`, default `[]`) on the `Project` row (`apps/api/prisma/schema.prisma`, initial migration `20260915163201_init`) instead of a separate `Message` table. Messages are only ever read or written as a whole per project — there is no requirement to query individual messages — so a `Message` table would add a join and a second cascade rule without buying anything.

This also makes deletion semantics trivially correct by construction: deleting a `User` cascades to their `Project` rows (the single FK rule, `onDelete: Cascade`), and every message disappears together with the project row because each message is part of that row. No orphan-message cleanup can exist, and resetting a conversation is a single update to `[]` rather than a bulk delete.

Each stored entry carries `role` (user | assistant), `content`, `createdAt`, and — for assistant messages — a `status` (`COMPLETED` / `PARTIAL` / `ERROR`) so a partially streamed response stays distinguishable after persistence. The trade-off is accepted consciously: individual messages cannot be indexed or queried in SQL, which this use case does not need.

When a chat turn happens, the full `conversation` array for the project is loaded and sent to the provider as the message history (role + content per entry); the new user prompt is appended, the streamed assistant reply is collected, and the updated array is persisted back (see §4 for the debounce). No truncation or length limit is applied yet — for the MVP the entire history is sent each turn; a token/context cap would be added if history grows past the model's window.

## 4. State management

Conversation state lives entirely on the client. The backend proxies the AI provider and forwards the assistant's reply to the frontend over SSE (Server-Sent Events) token-by-token; the frontend keeps the in-progress conversation — user prompts plus streamed assistant tokens — in component/store state. Because the reply is a live stream, we do not write to the database per token. Instead, the frontend debounces persistence: 30 seconds after the last activity (no user input and no incoming token), it sends the accumulated conversation to the backend, which upserts it into the `Project.conversation` JSONB column. This batches writes and keeps the JSONB column as the durable source of truth without per-token churn. The accepted trade-off is that up to ~30s of the latest exchange can be lost if the tab closes during that idle window.

## 5. What you would do differently

Process — sequencing. The mistake was letting visibility drive the order. As a backend engineer I know the API has to be done first; but as a fullstack dev I optimized for the part the eye can see — I built the UI shell and the auth flow early because the backend is invisible and frontend progress *feels* like progress. The graded core (a working, persisted chat) is all backend, and it stayed unfinished while the visible shell looked done. Next time: ship the invisible core (API + MVP chat) first, treat the UI as the last 10%.

Architecture. I'd model messages as their own `Message` table instead of a single JSONB `conversation` column. One row per message makes streaming writes and partial-response status persist as they arrive, avoids rewriting the entire conversation on every turn, and keeps messages queryable in SQL. For a chat MVP this is the simpler, more honest model; the JSONB "no extra join" saving wasn't worth the write-amplification. (This revises the §3 rationale with hindsight.)
