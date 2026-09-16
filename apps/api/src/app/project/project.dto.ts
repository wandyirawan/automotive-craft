import { IsString, MinLength } from "class-validator";

export class CreateProjectDto {
  @IsString()
  @MinLength(1, { message: "Nama project wajib diisi" })
  name: string;
}
