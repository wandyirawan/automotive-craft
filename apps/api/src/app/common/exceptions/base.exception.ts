import { HttpException, HttpStatus } from "@nestjs/common";

export interface ErrorResponseBody {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errors?: Record<string, string[]>,
  ) {
    const body: ErrorResponseBody = {
      statusCode,
      message,
      ...(errors && { errors }),
    };
    super(body, statusCode);
  }
}
