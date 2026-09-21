import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateJobApplicationDto {
  @ApiProperty({
    description: 'ID de la oferta de trabajo',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsUUID()
  job_id: string;

  @ApiPropertyOptional({
    description: 'Carta de presentación',
    example:
      'Me interesa este puesto porque tengo 5 años de experiencia en desarrollo web y he trabajado con tecnologías similares a las que ustedes utilizan. Mi experiencia previa en proyectos de e-commerce me ha permitido desarrollar habilidades que serían valiosas para su equipo.',
  })
  @IsOptional()
  @IsString()
  cover_letter?: string;
}
