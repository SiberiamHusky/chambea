import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'País de la dirección',
    example: 'Venezuela',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Estado o provincia de la dirección',
    example: 'Miranda',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Ciudad de la dirección',
    example: 'Caracas',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Dirección específica',
    example: 'Av. Francisco de Miranda, Torre Parque Cristal',
  })
  @IsString()
  address_line: string;

  @ApiProperty({
    description: 'Código postal',
    example: '1060',
    required: false,
  })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: 10.4806,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -66.9036,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
