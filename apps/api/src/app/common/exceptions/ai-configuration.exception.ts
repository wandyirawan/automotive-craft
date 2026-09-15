import { HttpException, HttpStatus } from "@nestjs/common";

export class AiConfigurationException extends HttpException {
  constructor(message: string) {
    super(
      {
        message,
        code: "AI_CONFIGURATION_ERROR",
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
