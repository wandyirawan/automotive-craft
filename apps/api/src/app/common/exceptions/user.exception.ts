import { HttpStatus } from "@nestjs/common";
import { AppException } from "./base.exception";

export class UserNotFoundException extends AppException {
  constructor(userId?: number) {
    super(
      userId ? `User #${userId} tidak ditemukan` : "User tidak ditemukan",
      HttpStatus.NOT_FOUND,
    );
  }
}
