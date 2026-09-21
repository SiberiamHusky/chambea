import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { IdentityDocumentType } from '../worker.entity';

export class CreateWorkerProfileDto {
  @ApiProperty({
    description: 'Breve descripción profesional del trabajador',
    example: 'Técnico electricista con 5 años de experiencia en instalaciones residenciales',
  })
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'Años de experiencia laboral',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  years_of_experience: number;

  @ApiProperty({
    description: 'Estado de disponibilidad actual del trabajador',
    example: 'AVAILABLE',
  })
  @IsNotEmpty()
  @IsString()
  availability_status: string;

  @ApiProperty({
    description: 'Tipo de tarifa ofrecida',
    example: 'HOURLY',
  })
  @IsNotEmpty()
  @IsString()
  rate_type: string;

  @ApiProperty({
    description: 'Monto de la tarifa',
    example: 20,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate_amount: number;

  @ApiProperty({
    description: 'Moneda en la que se expresa la tarifa',
    example: 'USD',
  })
  @IsNotEmpty()
  @IsString()
  rate_currency: string;

  @ApiPropertyOptional({
    description: 'Dirección personal del trabajador (texto libre). Ej: calle, ciudad, estado, país.',
    example: 'Av. Principal, Edif. Sol, Apto 3B, Caracas, Miranda, Venezuela',
  })
  @IsOptional()
  @IsString()
  base_location_address?: string;

  @ApiProperty({
    enum: IdentityDocumentType,
    description: 'Tipo de documento de identidad',
    example: 'V',
  })
  @IsNotEmpty()
  @IsEnum(IdentityDocumentType)
  identity_document_type_enum: IdentityDocumentType;

  @ApiProperty({
    description: 'Número del documento de identidad',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{6,10}$/, { message: 'El número de documento debe tener entre 6 y 10 dígitos.' })
  identity_document_number: string;

  @ApiPropertyOptional({ description: 'URL del CV subido (opcional)', example: '/uploads/cv/USERID/mi_cv.pdf' })
  @IsOptional()
  @IsString()
  cv_url?: string;
}
