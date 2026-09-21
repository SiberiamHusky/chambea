import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'País', example: 'Venezuela' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'Estado o provincia', example: 'Miranda' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'Ciudad', example: 'Caracas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'Dirección específica', example: 'Av. Francisco de Miranda, Torre Parque Cristal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line: string;

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
