import { Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma-svc/prisma.service";
import { CreateProjectDto } from "./project.dto";

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: number) {
    // TODO: buat project baru (name, userId), conversation default []
  }

  async findAll(userId: number) {
    // TODO: list project milik user
  }

  async findOne(id: number, userId: number) {
    // TODO: ambil 1 project (pastikan kepemilikan user)
  }

  async getConversation(id: number, userId: number) {
    // TODO: ambil kolom conversation (JSONB) dari project
  }
}
