import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { Address, Company } from '../../shared/entities';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { DatabaseCollectionNames, RateCurrency, RateType, WorkMode } from '../../shared/enums';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { Employer } from '../employer/employer.entity';

@Entity({ name: DatabaseCollectionNames.JOB_POSTING })
export class JobPosting {
  @ApiProperty({ description: 'ID único de la oferta', example: 'uuid-generado-automáticamente' })
  @PrimaryGeneratedColumn('uuid')
  job_id: string;

  @ApiProperty({ description: 'Título de la oferta', example: 'Desarrollador Backend Node.js' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Descripción detallada del puesto', example: 'Responsable del desarrollo de APIs con NestJS' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Lista de habilidades requeridas', example: ['NestJS', 'PostgreSQL', 'TypeORM'] })
  @Column({ type: 'simple-array', nullable: true })
  skills?: string[];

  @ApiProperty({ description: 'Modalidad de trabajo', enum: WorkMode, example: WorkMode.REMOTE })
  @Column({ type: 'enum', enum: WorkMode })
  work_mode: WorkMode;

  @ApiProperty({ description: 'Tipo de tarifa', enum: RateType, example: RateType.HOURLY })
  @Column({ type: 'enum', enum: RateType })
  rate_type: RateType;

  @ApiProperty({ description: 'Presupuesto mínimo', example: 10, required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget_min?: number;

  @ApiProperty({ description: 'Presupuesto máximo', example: 25, required: false })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget_max?: number;

  @ApiProperty({ description: 'Moneda del presupuesto', enum: RateCurrency, example: RateCurrency.USD })
  @Column({ type: 'enum', enum: RateCurrency })
  currency: RateCurrency;

  @ApiProperty({ description: 'Indica si la oferta está activa', example: true })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Employer creador de la oferta', type: () => Employer })
  @ManyToOne(() => Employer, { eager: true })
  @JoinColumn({ name: 'employer_id' })
  employer: Employer;

  @ApiProperty({ description: 'ID del employer creador', example: 'uuid-del-employer' })
  @Column()
  employer_id: string;

  @ApiProperty({ description: 'Empresa asociada (opcional)', type: () => Company, required: false })
  @ManyToOne(() => Company, { eager: true, nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ApiProperty({ description: 'ID de la empresa asociada (opcional)', required: false })
  @Column({ nullable: true })
  company_id?: string;

  @ApiProperty({ description: 'Dirección del puesto (opcional)', type: () => Address, required: false })
  @ManyToOne(() => Address, { eager: true, nullable: true })
  @JoinColumn({ name: 'job_address_id' })
  job_address?: Address;

  @ApiProperty({ description: 'ID de la dirección del puesto (opcional)', required: false })
  @Column({ nullable: true })
  job_address_id?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updated_at: Date;
}
