import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../shared/entities';
import { DatabaseCollectionNames, EmployerType } from '../../shared/enums';
import { User } from '../user/user.entity';

@Entity({ name: DatabaseCollectionNames.EMPLOYER })
export class Employer {
  @ApiProperty({
    description: 'El identificador único del employer',
    example: 'uuid-generado-automáticamente',
  })
  @PrimaryGeneratedColumn('uuid')
  employer_id: string;

  @ApiProperty({
    description: 'Usuario asociado al employer',
    type: () => User,
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'ID del usuario asociado',
    example: 'uuid-del-usuario',
  })
  @Column()
  user_id: string;

  @ApiProperty({
    description: 'Tipo de employer',
    example: EmployerType.COMPANY,
  })
  @Column({ type: 'enum', enum: EmployerType })
  employer_type: EmployerType;

  @ApiProperty({
    description: 'Empresa asociada (solo para employer tipo company)',
    type: () => Company,
    required: false,
  })
  @ManyToOne(() => Company, { eager: true, nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ApiProperty({
    description: 'ID de la empresa asociada (solo para employer tipo company)',
    example: 'uuid-de-empresa',
    required: false,
  })
  @Column({ nullable: true })
  company_id?: string;

  @ApiProperty({
    description: 'Biografía o descripción del employer',
    example: 'Empresario con 10 años de experiencia en el sector tecnológico',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiProperty({
    description: 'Años de experiencia como empleador',
    example: 5,
    required: false,
  })
  @Column({ nullable: true })
  years_as_employer?: number;

  @ApiProperty({
    description: 'Número de empleados contratados',
    example: 25,
    required: false,
  })
  @Column({ default: 0 })
  employees_hired_count: number;

  @ApiProperty({
    description: 'Calificación promedio del employer',
    example: 4.5,
    required: false,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  average_rating?: number;

  @ApiProperty({
    description: 'Número total de reseñas recibidas',
    example: 15,
    required: false,
  })
  @Column({ default: 0 })
  total_reviews: number;

  @ApiProperty({
    description: 'Indica si el employer está verificado',
    example: true,
  })
  @Column({ default: false })
  is_verified: boolean;

  @ApiProperty({
    description: 'Fecha de verificación',
    example: '2025-01-15T10:30:00Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

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
