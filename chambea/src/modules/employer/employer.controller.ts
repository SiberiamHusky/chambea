import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';

import { Company } from '../../shared/entities';
import { CreateCompanyDto, CreateEmployerDto, EmployerUpdateCompanyDto, UpdateEmployerDto } from './dtos';
import { Employer } from './employer.entity';
import { EmployerService } from './employer.service';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { User } from '../user/user.entity';

import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';

// Firma de callback de Multer para el filtro de archivos
type MulterFileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

@ApiTags('Employer')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
@ApiBadRequestResponse({
  type: BadRequestException,
})
@ApiNotFoundResponse({
  type: NotFoundException,
})
@ApiInternalServerErrorResponse({
  type: InternalServerErrorException,
})
@ApiUnauthorizedResponse({
  type: UnauthorizedException,
})
@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employer profile' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Employer profile created successfully',
    type: Employer,
  })
  async create(@Body() createEmployerDto: CreateEmployerDto, @GetUser() user: User): Promise<Employer> {
    // Si no se proporciona user_id, usar el del usuario autenticado
    if (!createEmployerDto.user_id) {
      createEmployerDto.user_id = user._id;
    }
    return this.employerService.create(createEmployerDto);
  }

  // Endpoints limitados: solo create y update

  @Patch(':id')
  @ApiOperation({ summary: 'Update employer profile' })
  @ApiParam({ name: 'id', description: 'Employer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Employer profile updated successfully',
    type: Employer,
  })
  async update(@Param('id') id: string, @Body() updateEmployerDto: UpdateEmployerDto): Promise<Employer> {
    return this.employerService.update(id, updateEmployerDto);
  }

  // Endpoints de Company: mantener create y update
  @Post('companies')
  @ApiOperation({
    summary: 'Create a new company',
    description: 'Opcionalmente acepta company_address anidado; si se envía, se crea la Address y se asocia a la Company.',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully',
    type: Company,
  })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto, @GetUser() user: User): Promise<Company> {
    return this.employerService.createCompany(createCompanyDto, user._id);
  }

  @Patch('companies/:id')
  @ApiOperation({
    summary: 'Update company',
    description:
      'Puede enviar company_address (anidado) para crear/actualizar la dirección asociada o company_address_id para enlazar una Address existente.',
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiBody({ type: EmployerUpdateCompanyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company updated successfully',
    type: Company,
  })
  async updateCompany(@Param('id') id: string, @Body() updateData: EmployerUpdateCompanyDto): Promise<Company> {
    return this.employerService.updateCompany(id, updateData);
  }

  // Lecturas para el perfil del empleador y su empresa asociada
  @Get('me')
  @ApiOperation({ summary: 'Obtener el perfil del empleador del usuario autenticado' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Perfil de empleador obtenido', type: Employer })
  async getMyEmployer(@GetUser() user: User): Promise<Employer> {
    return this.employerService.findByUserId(user._id);
  }

  @Get('companies/my')
  @ApiOperation({ summary: 'Obtener la empresa asociada al empleador del usuario autenticado' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Empresa del empleador obtenida', type: Company })
  async getMyCompany(@GetUser() user: User): Promise<Company> {
    const employer = await this.employerService.findByUserId(user._id);
    if (!employer.company) {
      throw new NotFoundException({ message: 'Company not found for current employer' });
    }
    return employer.company;
  }

  // Obtener employer por user_id (para casos como chats donde se necesita el nombre de la empresa del otro usuario)
  @Get('by-user/:id')
  @ApiOperation({ summary: 'Obtener el perfil del empleador por ID de usuario' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Perfil de empleador obtenido', type: Employer })
  async getEmployerByUserId(@Param('id') userId: string): Promise<Employer> {
    return this.employerService.findByUserId(userId);
  }

  // Vincular una empresa existente al employer autenticado
  @Post('companies/attach/:id')
  @ApiOperation({ summary: 'Vincular una empresa existente al employer autenticado' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Empresa vinculada al employer', type: Employer })
  async attachExistingCompany(@Param('id') id: string, @GetUser() user: User): Promise<Employer> {
    return this.employerService.attachCompanyForUser(user._id, id);
  }

  @Post('companies/:id/logo')
  @ApiOperation({ summary: 'Subir logo de la empresa' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logo subido y empresa actualizada', type: Company })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const companyId = (req.params?.id || 'unknown').toString();
          const dest = path.join(process.cwd(), 'uploads', 'company_logos', companyId);
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true });
          }
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
          const stamp = Date.now();
          cb(null, `${base}_${stamp}${ext}`);
        },
      }),
      fileFilter: (_req: any, file: any, cb: MulterFileFilterCallback) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new BadRequestException({ message: 'Solo imágenes (png, jpg, jpeg, gif, webp) están permitidas' }), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCompanyLogo(@Param('id') id: string, @UploadedFile() file: any): Promise<Company> {
    if (!file) {
      throw new BadRequestException({ message: 'No se recibió archivo' });
    }
    const relativeUrl = `/uploads/company_logos/${id}/${file.filename}`;
    return this.employerService.updateCompany(id, { company_logo_url: relativeUrl });
  }
}
