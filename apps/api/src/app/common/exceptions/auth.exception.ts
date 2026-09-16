import { HttpStatus } from "@nestjs/common";
import { AppException } from "./base.exception";

export class InvalidCredentialsException extends AppException {
  constructor() {
    super("Email atau password salah", HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = "Anda harus login") {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class SessionExpiredException extends AppException {
  constructor() {
    super("Session sudah kadaluarsa", HttpStatus.UNAUTHORIZED);
  }
}
