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
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { User } from '../user/user.entity';

import { ApplicationsService } from './applications.service';
import { CreateJobApplicationDto, UpdateJobApplicationDto } from './dtos';
import { JobApplication } from './job-application.entity';

@ApiTags('Applications')
@ApiBadRequestResponse({ type: BadRequestException })
@ApiNotFoundResponse({ type: NotFoundException })
@ApiInternalServerErrorResponse({ type: InternalServerErrorException })
@ApiUnauthorizedResponse({ type: UnauthorizedException })
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva aplicación a un job' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Aplicación creada',
    type: JobApplication,
    schema: {
      example: {
        application_id: '123e4567-e89b-12d3-a456-426614174000',
        job_id: '123e4567-e89b-12d3-a456-426614174001',
        worker_id: '123e4567-e89b-12d3-a456-426614174002',
        status: 'applied',
        cover_letter: 'Me interesa este puesto porque tengo experiencia en el sector y...',
        created_at: '2025-01-15T14:30:00.000Z',
        updated_at: '2025-01-15T14:30:00.000Z',
      },
    },
  })
  async create(@GetUser() user: User, @Body() dto: CreateJobApplicationDto): Promise<JobApplication> {
    return this.applicationsService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una aplicación de trabajo' })
  @ApiParam({ name: 'id', description: 'ID de la aplicación', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Aplicación actualizada',
    type: JobApplication,
    schema: {
      example: {
        application_id: '123e4567-e89b-12d3-a456-426614174000',
        job_id: '123e4567-e89b-12d3-a456-426614174001',
        worker_id: '123e4567-e89b-12d3-a456-426614174002',
        status: 'shortlisted',
        cover_letter: 'Carta de presentación actualizada con más detalles...',
        created_at: '2025-01-15T14:30:00.000Z',
        updated_at: '2025-01-15T15:45:00.000Z',
      },
    },
  })
  async update(@GetUser() user: User, @Param('id') id: string, @Body() dto: UpdateJobApplicationDto): Promise<JobApplication> {
    return this.applicationsService.update(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una aplicación de trabajo' })
  @ApiParam({ name: 'id', description: 'ID de la aplicación', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Aplicación eliminada',
    schema: {
      example: {
        statusCode: 200,
        message: 'Aplicación eliminada correctamente',
      },
    },
  })
  async remove(@GetUser() user: User, @Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(user, id);
  }

  @Get('job/:id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar postulaciones de un trabajo (solo dueño empleador)' })
  @ApiParam({ name: 'id', description: 'ID del job', example: '123e4567-e89b-12d3-a456-426614174001' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de postulaciones', type: JobApplication, isArray: true })
  async listForJob(@GetUser() user: User, @Param('id') id: string): Promise<JobApplication[]> {
    return this.applicationsService.listForJob(user, id);
  }

  @Get('my')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis postulaciones (solo trabajador autenticado)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de postulaciones del trabajador', type: JobApplication, isArray: true })
  async listMine(@GetUser() user: User): Promise<JobApplication[]> {
    return this.applicationsService.listMine(user);
  }
}
