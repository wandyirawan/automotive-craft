import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./auth.dto";
import { Public, CurrentUser } from "./auth.decorators";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login user, set session cookie.
   * @returns Data user + status login
   */
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto, @Req() req: FastifyRequest) {
    const user = await this.authService.validateCredentials(dto);

    // Set session — @fastify/session handle cookie otomatis
    req.session.userId = user.id;
    req.session.email = user.email;

    return {
      data: { user },
      message: "Login berhasil",
    };
  }

  /**
   * Ambil profil user yang sedang login.
   */
  @Get("me")
  me(@CurrentUser("userId") userId: number) {
    return this.authService.getProfile(userId);
  }

  /**
   * Logout, hancurkan session di server.
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: FastifyRequest) {
    await req.session.destroy();
    return {
      data: null,
      message: "Logout berhasil",
    };
  }
}
