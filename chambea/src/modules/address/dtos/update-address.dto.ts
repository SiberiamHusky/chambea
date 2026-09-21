import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'País', example: 'Venezuela' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Estado o provincia', example: 'Miranda' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Ciudad', example: 'Caracas' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Dirección específica', example: 'Av. Francisco de Miranda, Torre Parque Cristal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_line?: string;

  @ApiPropertyOptional({ description: 'Código postal', example: '1060' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  postal_code?: string;

  @ApiPropertyOptional({ description: 'Latitud', example: 10.4806 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitud', example: -66.9036 })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
