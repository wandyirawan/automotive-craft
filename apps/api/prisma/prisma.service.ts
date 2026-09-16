// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../src/generated/prisma/client"; // 1. Impor dari path output Anda
import { PrismaPg } from "@prisma/adapter-pg"; // 2. Impor adapter

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 3. Buat instance adapter
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    // 4. Berikan adapter ke PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
