import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { DatabaseCollectionNames, JobApplicationStatus } from '../../shared/enums';
import { JobPosting } from '../jobs/job-posting.entity';
import { Worker } from '../worker/worker.entity';

@Entity({ name: DatabaseCollectionNames.JOB_APPLICATION })
export class JobApplication {
  @ApiProperty({ description: 'ID único de la aplicación', example: 'uuid-generado-automáticamente' })
  @PrimaryGeneratedColumn('uuid')
  application_id: string;

  @ApiProperty({ description: 'Oferta de trabajo asociada', type: () => JobPosting })
  @ManyToOne(() => JobPosting, { eager: true })
  @JoinColumn({ name: 'job_id' })
  job: JobPosting;

  @ApiProperty({ description: 'ID de la oferta asociada' })
  @Column()
  job_id: string;

  @ApiProperty({ description: 'Worker que aplica', type: () => Worker })
  @ManyToOne(() => Worker, { eager: true })
  @JoinColumn({ name: 'worker_id' })
  worker: Worker;

  @ApiProperty({ description: 'ID del worker que aplica' })
  @Column()
  worker_id: string;

  @ApiProperty({ description: 'Estado de la aplicación', enum: JobApplicationStatus, example: JobApplicationStatus.APPLIED })
  @Column({ type: 'enum', enum: JobApplicationStatus, default: JobApplicationStatus.APPLIED })
  status: JobApplicationStatus;

  @ApiProperty({ description: 'Carta de presentación del candidato', required: false })
  @Column({ type: 'text', nullable: true })
  cover_letter?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updated_at: Date;
}
