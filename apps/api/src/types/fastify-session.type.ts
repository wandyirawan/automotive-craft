// apps/api/src/types/fastify-session.type.ts
import "@fastify/session";

declare module "@fastify/session" {
  interface FastifySessionObject {
    userId?: number;
    email?: string;
  }
}
