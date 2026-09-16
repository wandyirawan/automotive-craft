import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma-svc";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cari user by email (termasuk passwordHash untuk verifikasi login).
   */
  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Cari user by ID (tanpa passwordHash).
   */
  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
    });
  }
}
