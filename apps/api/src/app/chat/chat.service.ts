import { Injectable, Inject } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { PrismaService } from "@prisma-svc/prisma.service";
import { AiProvider } from "../ai/ai-provider.interface";
import { AI_PROVIDER } from "../ai/ai.factory";
import { ChatRequestDto } from "./chat.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly ai: AiProvider,
  ) {}

  async stream(
    projectId: number,
    dto: ChatRequestDto,
    userId: number,
    res: FastifyReply,
  ) {
    // TODO: load conversation (JSONB) dari Project, append user prompt,
    // panggil this.ai.stream(), teruskan token ke SSE response,
    // simpan hasil ke Project.conversation (lihat DECISIONS.md §3/§4)
  }
}
