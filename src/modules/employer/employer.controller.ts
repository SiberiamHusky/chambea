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
import { Body, Controller, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { Company } from '../../shared/entities';
import { CreateCompanyDto, CreateEmployerDto, UpdateEmployerDto } from './dtos';
import { Employer } from './employer.entity';
import { EmployerService } from './employer.service';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { User } from '../user/user.entity';

import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';

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
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully',
    type: Company,
  })
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.employerService.createCompany(createCompanyDto);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company updated successfully',
    type: Company,
  })
  async updateCompany(@Param('id') id: string, @Body() updateData: Partial<CreateCompanyDto>): Promise<Company> {
    return this.employerService.updateCompany(id, updateData);
  }
}
