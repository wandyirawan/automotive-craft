import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { ChatService } from "./chat.service";
import { ChatRequestDto } from "./chat.dto";
import { CurrentUser } from "../auth/auth.decorators";

@Controller("v1/chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(":projectId")
  async chat(
    @Param("projectId") projectId: string,
    @Body() dto: ChatRequestDto,
    @CurrentUser("userId") userId: number,
    @Res() res: FastifyReply,
  ) {
    return this.chatService.stream(Number(projectId), dto, userId, res);
  }
}
