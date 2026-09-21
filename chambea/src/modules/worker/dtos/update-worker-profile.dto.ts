import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { IdentityDocumentType } from '../worker.entity';

export class UpdateWorkerProfileDto {
  @ApiPropertyOptional({ description: 'Descripción profesional' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Años de experiencia' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  years_of_experience?: number;

  @ApiPropertyOptional({ description: 'Estado de disponibilidad', example: 'AVAILABLE' })
  @IsOptional()
  @IsString()
  availability_status?: string;

  @ApiPropertyOptional({ description: 'Tipo de tarifa', example: 'hourly' })
  @IsOptional()
  @IsString()
  rate_type?: string;

  @ApiPropertyOptional({ description: 'Monto de la tarifa', example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rate_amount?: number;

  @ApiPropertyOptional({ description: 'Moneda de la tarifa', example: 'USD' })
  @IsOptional()
  @IsString()
  rate_currency?: string;

  @ApiPropertyOptional({ description: 'Dirección base (texto libre)' })
  @IsOptional()
  @IsString()
  base_location_address?: string;

  @ApiPropertyOptional({ enum: IdentityDocumentType, description: 'Tipo de documento de identidad' })
  @IsOptional()
  @IsEnum(IdentityDocumentType)
  identity_document_type_enum?: IdentityDocumentType;

  @ApiPropertyOptional({ description: 'Número de documento de identidad' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6,10}$/, { message: 'El número de documento debe tener entre 6 y 10 dígitos.' })
  identity_document_number?: string;

  @ApiPropertyOptional({ description: 'URL del CV subido (opcional)' })
  @IsOptional()
  @IsString()
  cv_url?: string;
}
