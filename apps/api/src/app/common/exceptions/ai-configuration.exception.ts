import { HttpException, HttpStatus } from "@nestjs/common";
import { AppException } from "./base.exception";

export class AiConfigurationException extends AppException {
  constructor(message = "Ai configuration error") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
