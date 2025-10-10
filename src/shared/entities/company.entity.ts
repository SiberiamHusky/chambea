import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { Address } from './address.entity';
import { CompanySize, DatabaseCollectionNames, Industry, VerificationStatus } from '../enums';

@Entity({ name: DatabaseCollectionNames.COMPANY })
export class Company {
  @ApiProperty({
    description: 'El identificador único de la empresa',
    example: 'uuid-generado-automáticamente',
  })
  @PrimaryGeneratedColumn('uuid')
  company_id: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'TechCorp Solutions C.A.',
  })
  @Column()
  company_name: string;

  @ApiProperty({
    description: 'RIF de la empresa',
    example: 'J-12345678-9',
  })
  @Column({ unique: true })
  company_rif: string;

  @ApiProperty({
    description: 'Descripción de la empresa',
    example: 'Empresa líder en soluciones tecnológicas innovadoras',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  company_description?: string;

  @ApiProperty({
    description: 'Sitio web de la empresa',
    example: 'https://www.techcorp.com',
    required: false,
  })
  @Column({ nullable: true })
  company_website?: string;

  @ApiProperty({
    description: 'Teléfono de la empresa',
    example: '+58-212-1234567',
    required: false,
  })
  @Column({ nullable: true })
  company_phone?: string;

  @ApiProperty({
    description: 'Email de contacto de la empresa',
    example: 'contacto@techcorp.com',
    required: false,
  })
  @Column({ nullable: true })
  company_email?: string;

  @ApiProperty({
    description: 'Industria de la empresa',
    example: Industry.TECHNOLOGY,
  })
  @Column({ type: 'enum', enum: Industry })
  industry: Industry;

  @ApiProperty({
    description: 'Tamaño de la empresa',
    example: CompanySize.MEDIUM,
  })
  @Column({ type: 'enum', enum: CompanySize })
  company_size: CompanySize;

  @ApiProperty({
    description: 'Número de empleados',
    example: 150,
    required: false,
  })
  @Column({ nullable: true })
  employee_count?: number;

  @ApiProperty({
    description: 'Año de fundación',
    example: 2010,
    required: false,
  })
  @Column({ nullable: true })
  founded_year?: number;

  @ApiProperty({
    description: 'Estado de verificación de la empresa',
    example: VerificationStatus.VERIFIED,
  })
  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  verification_status: VerificationStatus;

  @ApiProperty({
    description: 'URL del logo de la empresa',
    example: 'https://www.techcorp.com/logo.png',
    required: false,
  })
  @Column({ nullable: true })
  company_logo_url?: string;

  @ApiProperty({
    description: 'Dirección de la empresa',
    type: () => Address,
  })
  @ManyToOne(() => Address, { eager: true })
  @JoinColumn({ name: 'company_address_id' })
  company_address: Address;

  @ApiProperty({
    description: 'ID de la dirección de la empresa',
    example: 'uuid-de-direccion',
  })
  @Column()
  company_address_id: string;

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
