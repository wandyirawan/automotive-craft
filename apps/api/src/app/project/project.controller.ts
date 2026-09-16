import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ProjectService } from "./project.service";
import { CreateProjectDto, UpdateProjectDto } from "./project.dto";
import { AuthGuard } from "../auth/auth.guard";
import { ResponseHelper } from "../common/helpers/response.helper";
import { ProjectStatus } from "@prisma-gnt/client";
interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    name: string;
  };
}

@Controller("v1/projects")
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // Get all projects for current user
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const projects = await this.projectService.findAll(req.user.id);
    return ResponseHelper.success(projects, "Projects retrieved successfully");
  }

  // Get single project
  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const project = await this.projectService.findOneWithConversation(
      id,
      req.user.id,
    );
    return ResponseHelper.success(project, "Project retrieved successfully");
  }

  // Create new project
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto, @Req() req: RequestWithUser) {
    const project = await this.projectService.create(req.user.id, dto);
    return ResponseHelper.success(
      project,
      "Project created successfully",
      "CREATED",
    );
  }

  // Update project
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    const project = await this.projectService.update(id, req.user.id, dto);
    return ResponseHelper.success(project, "Project updated successfully");
  }

  // Delete project
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    await this.projectService.remove(id, req.user.id);
    return ResponseHelper.success(null, "Project deleted successfully");
  }

  // Update project status
  @Put(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: ProjectStatus,
    @Req() req: RequestWithUser,
  ) {
    const project = await this.projectService.updateStatus(
      id,
      req.user.id,
      status,
    );
    return ResponseHelper.success(
      project,
      "Project status updated successfully",
    );
  }
}
