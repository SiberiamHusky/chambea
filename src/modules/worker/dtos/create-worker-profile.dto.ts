import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { IdentityDocumentType } from '../worker.entity';

export class CreateWorkerProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  years_of_experience: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  availability_status: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rate_type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate_amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  rate_currency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  base_location_address_id?: string;

  @ApiProperty({
    enum: IdentityDocumentType,
    example: 'V',
  })
  @IsNotEmpty()
  @IsEnum(IdentityDocumentType)
  identity_document_type_enum: IdentityDocumentType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{6,10}$/, { message: 'El número de documento debe tener entre 6 y 10 dígitos.' })
  identity_document_number: string;
}
