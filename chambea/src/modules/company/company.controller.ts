import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

import { Company } from '../../shared/entities';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas (público)' })
  @ApiResponse({ status: 200, description: 'Lista de empresas', type: Company, isArray: true })
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada', type: Company })
  async create(@Body() dto: CreateCompanyDto): Promise<Company> {
    return this.companyService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una empresa existente' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada', type: Company })
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto): Promise<Company> {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una empresa por ID' })
  @ApiResponse({ status: 204, description: 'Empresa eliminada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.companyService.remove(id);
  }
}
