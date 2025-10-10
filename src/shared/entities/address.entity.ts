import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DatabaseCollectionNames } from '../enums';

@Entity({ name: DatabaseCollectionNames.ADDRESS })
export class Address {
  @ApiProperty({
    description: 'El identificador único de la dirección',
    example: 'uuid-generado-automáticamente',
  })
  @PrimaryGeneratedColumn('uuid')
  address_id: string;

  @ApiProperty({
    description: 'País de la dirección',
    example: 'Venezuela',
  })
  @Column()
  country: string;

  @ApiProperty({
    description: 'Estado o provincia de la dirección',
    example: 'Miranda',
  })
  @Column()
  state: string;

  @ApiProperty({
    description: 'Ciudad de la dirección',
    example: 'Caracas',
  })
  @Column()
  city: string;

  @ApiProperty({
    description: 'Dirección específica',
    example: 'Av. Francisco de Miranda, Torre Parque Cristal',
  })
  @Column()
  address_line: string;

  @ApiProperty({
    description: 'Código postal',
    example: '1060',
    required: false,
  })
  @Column({ nullable: true })
  postal_code?: string;

  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: 10.4806,
    required: false,
  })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -66.9036,
    required: false,
  })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @ApiProperty({
    description: 'Fecha de creación',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
