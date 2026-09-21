import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateCompanyDto as CanonicalUpdateCompanyDto } from '../../company/dtos/update-company.dto';
import { CreateAddressDto } from './create-address.dto';

export class EmployerUpdateCompanyDto extends CanonicalUpdateCompanyDto {
  @ApiPropertyOptional({
    type: CreateAddressDto,
    description: 'Dirección anidada para crear/actualizar y asociar a la compañía',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  company_address?: CreateAddressDto;
}
