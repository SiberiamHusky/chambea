import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { ApiProperty } from '@nestjs/swagger';
import { EmployerType } from '../../../shared/enums';

export class CreateEmployerDto {
  @ApiProperty({
    description: 'ID del usuario que será employer',
    example: 'uuid-del-usuario',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Tipo de employer',
    example: EmployerType.COMPANY,
    enum: EmployerType,
  })
  @IsEnum(EmployerType)
  employer_type: EmployerType;

  @ApiProperty({
    description: 'ID de la empresa (requerido solo para employer tipo company)',
    example: 'uuid-de-empresa',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({
    description: 'Biografía o descripción del employer',
    example: 'Empresario con 10 años de experiencia en el sector tecnológico',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Años de experiencia como empleador',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  years_as_employer?: number;
}
