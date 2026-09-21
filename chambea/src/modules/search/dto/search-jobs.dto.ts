import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchJobsDto {
  @ApiProperty({
    description: 'Término de búsqueda para el título o descripción del trabajo',
    example: 'desarrollador web',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Ubicación del trabajo',
    example: 'Ciudad de México',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Categoría del trabajo',
    example: 'Tecnología',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Salario mínimo',
    example: 30000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minSalary?: number;

  @ApiProperty({
    description: 'Salario máximo',
    example: 60000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxSalary?: number;

  @ApiProperty({
    description: 'Tipo de trabajo (remoto, presencial, híbrido)',
    example: 'remoto',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobType?: string;

  @ApiProperty({
    description: 'Página actual para paginación',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de resultados por página',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
