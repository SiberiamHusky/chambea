import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { CompanySize, Industry } from '../../../shared/enums';
import { CreateAddressDto } from './create-address.dto';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'TechCorp Solutions C.A.',
  })
  @IsString()
  company_name: string;

  @ApiProperty({
    description: 'RIF de la empresa',
    example: 'J-12345678-9',
  })
  @IsString()
  company_rif: string;

  @ApiProperty({
    description: 'Descripción de la empresa',
    example: 'Empresa líder en soluciones tecnológicas innovadoras',
    required: false,
  })
  @IsOptional()
  @IsString()
  company_description?: string;

  @ApiProperty({
    description: 'Sitio web de la empresa',
    example: 'https://www.techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  company_website?: string;

  @ApiProperty({
    description: 'Teléfono de la empresa',
    example: '+58-212-1234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  company_phone?: string;

  @ApiProperty({
    description: 'Email de contacto de la empresa',
    example: 'contacto@techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  company_email?: string;

  @ApiProperty({
    description: 'Industria de la empresa',
    example: Industry.TECHNOLOGY,
    enum: Industry,
  })
  @IsEnum(Industry)
  industry: Industry;

  @ApiProperty({
    description: 'Tamaño de la empresa',
    example: CompanySize.MEDIUM,
    enum: CompanySize,
  })
  @IsEnum(CompanySize)
  company_size: CompanySize;

  @ApiProperty({
    description: 'Número de empleados',
    example: 150,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employee_count?: number;

  @ApiProperty({
    description: 'Año de fundación',
    example: 2010,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  founded_year?: number;

  @ApiProperty({
    description: 'URL del logo de la empresa',
    example: 'https://www.techcorp.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  company_logo_url?: string;

  @ApiProperty({
    description: 'Dirección de la empresa',
    type: CreateAddressDto,
  })
  company_address: CreateAddressDto;
}
