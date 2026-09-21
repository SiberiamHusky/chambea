import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

import { RateCurrency, RateType, WorkMode } from '../../../shared/enums';

export class GetJobsQueryDto {
  @ApiPropertyOptional({ description: 'Página a consultar', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Cantidad de elementos por página', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar por modalidad de trabajo', enum: WorkMode })
  @IsOptional()
  @IsEnum(WorkMode)
  work_mode?: WorkMode;

  @ApiPropertyOptional({ description: 'Filtrar por tipo de tarifa', enum: RateType })
  @IsOptional()
  @IsEnum(RateType)
  rate_type?: RateType;

  @ApiPropertyOptional({ description: 'Filtrar por moneda', enum: RateCurrency })
  @IsOptional()
  @IsEnum(RateCurrency)
  currency?: RateCurrency;

  @ApiPropertyOptional({ description: 'Filtrar por employer_id', example: 'uuid-del-employer' })
  @IsOptional()
  @IsUUID()
  employer_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar por company_id', example: 'uuid-de-empresa' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ description: 'Buscar por título o descripción', example: 'backend' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por habilidades (contiene alguna)', type: [String], example: ['NestJS', 'SQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
