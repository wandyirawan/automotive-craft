export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export class ResponseHelper {
  static success<T>(data: T, message?: string, code?: string): ApiResponse<T> {
    return {
      data,
      message: message || "Success",
      code: code || "SUCCESS",
    };
  }

  static error(
    message: string,
    code: string,
    errors?: Record<string, string[]>,
  ): ApiError {
    return {
      message,
      code,
      errors,
    };
  }
}
