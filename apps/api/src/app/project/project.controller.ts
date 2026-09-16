import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { ProjectService } from "./project.service";
import { CreateProjectDto } from "./project.dto";
import { CurrentUser } from "../auth/auth.decorators";

@Controller("v1/projects")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser("userId") userId: number,
  ) {
    return this.projectService.create(dto, userId);
  }

  @Get()
  async findAll(@CurrentUser("userId") userId: number) {
    return this.projectService.findAll(userId);
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser("userId") userId: number,
  ) {
    return this.projectService.findOne(Number(id), userId);
  }

  @Get(":id/conversation")
  async getConversation(
    @Param("id") id: string,
    @CurrentUser("userId") userId: number,
  ) {
    return this.projectService.getConversation(Number(id), userId);
  }
}
