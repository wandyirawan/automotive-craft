import { Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt"; // 👈 ganti dari argon2
import { UsersService } from "../users/users.service";
import { LoginRequestDto } from "./auth.dto";
import {
  InvalidCredentialsException,
  UserNotFoundException,
} from "../common/exceptions";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Validasi kredensial user dari email & password.
   * @throws {InvalidCredentialsException}
   */
  async validateCredentials(dto: LoginRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsException();

    const isValid = await bcrypt.compare(dto.password, user.passwordHash); // 👈
    if (!isValid) throw new InvalidCredentialsException();

    this.logger.log(`Login berhasil: ${user.email} (id=${user.id})`);

    return { id: user.id, email: user.email, name: user.name };
  }

  /**
   * Ambil profil user yang sedang login.
   * @throws {UserNotFoundException}
   */
  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UserNotFoundException(userId);
    return user;
  }
}
