import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum ProjectStatus {
  DRAFT = "DRAFT",
  COMPLETED = "COMPLETED",
}

export class CreateProjectDto {
  @ApiProperty({
    description: "Project name",
    example: "My AI Assistant",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: "Project name is required" })
  @MinLength(3, { message: "Project name must be at least 3 characters" })
  @MaxLength(100, { message: "Project name must not exceed 100 characters" })
  name: string;

  @ApiPropertyOptional({
    description: "Project status",
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
    example: ProjectStatus.DRAFT,
  })
  @IsEnum(ProjectStatus, { message: "Invalid status value" })
  @IsOptional()
  status?: ProjectStatus;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: "Project name",
    example: "Updated Project Name",
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: "Project name must be at least 3 characters" })
  @MaxLength(100, { message: "Project name must not exceed 100 characters" })
  name?: string;

  @ApiPropertyOptional({
    description: "Project status",
    enum: ProjectStatus,
    example: ProjectStatus.COMPLETED,
  })
  @IsEnum(ProjectStatus, { message: "Invalid status value" })
  @IsOptional()
  status?: ProjectStatus;
}

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: "New project status",
    enum: ProjectStatus,
    example: ProjectStatus.COMPLETED,
  })
  @IsEnum(ProjectStatus, { message: "Invalid status value" })
  @IsNotEmpty({ message: "Status is required" })
  status: ProjectStatus;
}

// Response DTOs (optional, untuk type safety)
export class ProjectResponseDto {
  id: number;
  name: string;
  status: ProjectStatus;
  userId: number;
  conversation: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectListResponseDto {
  id: number;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}
