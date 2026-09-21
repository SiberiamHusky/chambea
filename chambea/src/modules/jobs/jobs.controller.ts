import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';
import { CreateJobPostingDto, UpdateJobPostingDto } from './dtos';
import { JobPosting } from './job-posting.entity';
import { JobsService } from './jobs.service';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { GetUser } from '../auth/decorators/get-user.decorator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { User } from '../user/user.entity';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { GetJobsQueryDto } from './dtos/get-jobs.query.dto';

@ApiTags('Jobs')
@ApiBadRequestResponse({ type: BadRequestException })
@ApiNotFoundResponse({ type: NotFoundException })
@ApiInternalServerErrorResponse({ type: InternalServerErrorException })
@ApiUnauthorizedResponse({ type: UnauthorizedException })
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ofertas de trabajo con filtros' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de ofertas', type: JobPosting, isArray: true })
  async findAll(@Query() query: GetJobsQueryDto): Promise<JobPosting[]> {
    return this.jobsService.findAll(query);
  }

  // Definir antes de ':id' para evitar colisión de rutas
  @Get('my-jobs')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis ofertas de trabajo (empleador autenticado)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Mis ofertas', type: JobPosting, isArray: true })
  async listMyJobs(@GetUser() user: User): Promise<JobPosting[]> {
    return this.jobsService.findAllMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una oferta de trabajo' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalle de oferta', type: JobPosting })
  async findOne(@Param('id') id: string): Promise<JobPosting> {
    return this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva oferta de trabajo' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Oferta creada', type: JobPosting })
  async create(@GetUser() user: User, @Body() dto: CreateJobPostingDto): Promise<JobPosting> {
    return this.jobsService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una oferta' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Oferta actualizada', type: JobPosting })
  async update(@GetUser() user: User, @Param('id') id: string, @Body() dto: UpdateJobPostingDto): Promise<JobPosting> {
    return this.jobsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una oferta' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Oferta eliminada' })
  async remove(@GetUser() user: User, @Param('id') id: string): Promise<void> {
    return this.jobsService.remove(user, id);
  }
}
