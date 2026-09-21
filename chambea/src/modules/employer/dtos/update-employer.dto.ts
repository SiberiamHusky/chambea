import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { CreateEmployerDto } from './create-employer.dto';

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {
  @ApiProperty({
    description: 'Indica si el employer está verificado',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
