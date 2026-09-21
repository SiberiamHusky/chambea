import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { JobApplicationStatus } from '../../../shared/enums';

export class UpdateJobApplicationDto {
  @ApiPropertyOptional({
    description: 'Actualizar el estado de la aplicación',
    enum: JobApplicationStatus,
    example: JobApplicationStatus.SHORTLISTED,
    enumName: 'JobApplicationStatus',
  })
  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;

  @ApiPropertyOptional({
    description: 'Actualizar la carta de presentación',
    example:
      'Quisiera añadir que también tengo experiencia en liderazgo de equipos y gestión de proyectos ágiles, lo que podría ser valioso para esta posición.',
  })
  @IsOptional()
  @IsString()
  cover_letter?: string;
}
