import { IsString, MinLength } from "class-validator";

export class ChatRequestDto {
  @IsString()
  @MinLength(1, { message: "Pesan tidak boleh kosong" })
  message: string;
}
