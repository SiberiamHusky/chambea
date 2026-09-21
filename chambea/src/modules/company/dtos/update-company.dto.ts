import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min } from 'class-validator';
import { CompanySize, Industry } from '../../../shared/enums';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Nombre de la empresa', example: 'TechCorp Solutions C.A.' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  company_name?: string;

  @ApiPropertyOptional({ description: 'RIF de la empresa (formato: J-12345678-9)', example: 'J-12345678-9' })
  @IsString()
  @Matches(/^[JGVEP]-\d{8}-\d$/i, { message: 'El RIF debe tener el formato: J-12345678-9' })
  @IsOptional()
  company_rif?: string;

  @ApiPropertyOptional({ description: 'Descripción de la empresa', example: 'Empresa líder en soluciones tecnológicas innovadoras' })
  @IsString()
  @IsOptional()
  company_description?: string;

  @ApiPropertyOptional({ description: 'Sitio web de la empresa', example: 'https://www.techcorp.com' })
  @IsUrl()
  @IsOptional()
  company_website?: string;

  @ApiPropertyOptional({ description: 'Teléfono de la empresa', example: '+58-212-1234567' })
  @IsString()
  @IsOptional()
  company_phone?: string;

  @ApiPropertyOptional({ description: 'Email de contacto', example: 'contacto@techcorp.com' })
  @IsEmail()
  @IsOptional()
  company_email?: string;

  @ApiPropertyOptional({ description: 'Industria de la empresa', enum: Industry, example: Industry.TECHNOLOGY })
  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @ApiPropertyOptional({ description: 'Tamaño de la empresa', enum: CompanySize, example: CompanySize.MEDIUM })
  @IsEnum(CompanySize)
  @IsOptional()
  company_size?: CompanySize;

  @ApiPropertyOptional({ description: 'Número de empleados', example: 150 })
  @IsInt()
  @Min(1)
  @IsOptional()
  employee_count?: number;

  @ApiPropertyOptional({ description: 'Año de fundación', example: 2010 })
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  @IsOptional()
  founded_year?: number;

  @ApiPropertyOptional({ description: 'URL del logo', example: 'https://www.techcorp.com/logo.png' })
  @IsUrl()
  @IsOptional()
  company_logo_url?: string;

  @ApiPropertyOptional({ description: 'ID de la dirección de la empresa', example: 'uuid-de-direccion' })
  @IsString()
  @IsOptional()
  company_address_id?: string;
}
