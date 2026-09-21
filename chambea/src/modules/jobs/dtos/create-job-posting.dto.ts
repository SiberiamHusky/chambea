import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { CreateAddressDto } from '../../employer/dtos/create-address.dto';
import { RateCurrency, RateType, WorkMode } from '../../../shared/enums';

export class CreateJobPostingDto {
  @ApiProperty({ description: 'Título de la oferta', example: 'Desarrollador Backend Node.js' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descripción detallada del puesto', example: 'Responsable del desarrollo de APIs con NestJS' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Lista de habilidades requeridas', example: ['NestJS', 'PostgreSQL', 'TypeORM'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'Modalidad de trabajo', enum: WorkMode, example: WorkMode.REMOTE })
  @IsEnum(WorkMode)
  work_mode: WorkMode;

  @ApiProperty({ description: 'Tipo de tarifa', enum: RateType, example: RateType.HOURLY })
  @IsEnum(RateType)
  rate_type: RateType;

  @ApiProperty({ description: 'Presupuesto mínimo', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget_min?: number;

  @ApiProperty({ description: 'Presupuesto máximo', example: 25, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  budget_max?: number;

  @ApiProperty({ description: 'Moneda del presupuesto', enum: RateCurrency, example: RateCurrency.USD })
  @IsEnum(RateCurrency)
  currency: RateCurrency;

  @ApiProperty({ description: 'Indica si la oferta está activa', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'ID del employer creador', example: 'uuid-del-employer' })
  @IsUUID()
  employer_id: string;

  @ApiProperty({ description: 'ID de la empresa asociada (opcional)', required: false })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ description: 'Dirección del puesto (opcional)', required: false, type: () => CreateAddressDto })
  @IsOptional()
  job_address?: CreateAddressDto;
}
