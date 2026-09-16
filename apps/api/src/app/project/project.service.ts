import { Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma-svc/prisma.service";
import { CreateProjectDto, UpdateProjectDto } from "./project.dto";
import { ProjectStatus } from "@prisma-gnt/client";
import { AppException } from "../common/exceptions/base.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // Get all projects for a user
  async findAll(userId: number) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Get single project by ID
  async findOne(projectId: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppException("Project not found", HttpStatus.NOT_FOUND);
    }

    if (project.userId !== userId) {
      throw new AppException(
        "You do not have access to this project",
        HttpStatus.FORBIDDEN,
      );
    }

    return project;
  }

  // Create new project
  async create(userId: number, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        status: dto.status || ProjectStatus.DRAFT,
        userId,
        conversation: [], // Initialize empty conversation
      },
    });
  }

  // Update project
  async update(projectId: number, userId: number, dto: UpdateProjectDto) {
    // Check if project exists and belongs to user
    await this.findOne(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  // Delete project
  async remove(projectId: number, userId: number) {
    // Check if project exists and belongs to user
    await this.findOne(projectId, userId);

    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }

  // Update project status
  async updateStatus(projectId: number, userId: number, status: ProjectStatus) {
    await this.findOne(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  // Get project with full conversation
  async findOneWithConversation(projectId: number, userId: number) {
    const project = await this.findOne(projectId, userId);

    return {
      ...project,
      conversation: project.conversation || [],
    };
  }
}
