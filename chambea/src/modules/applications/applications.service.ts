import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';
import { CreateJobApplicationDto, UpdateJobApplicationDto } from './dtos';
import { JobApplication } from './job-application.entity';
import { JobApplicationStatus, UserType } from '../../shared/enums';
import { JobPosting } from '../jobs/job-posting.entity';
import { User } from '../user/user.entity';

import { Worker } from '../worker/worker.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) {}

  async create(user: User, dto: CreateJobApplicationDto): Promise<JobApplication> {
    try {
      if (user.user_type !== UserType.WORKER) {
        throw new UnauthorizedException({ message: 'Only workers can apply to jobs' });
      }

      const job = await this.jobRepository.findOne({ where: { job_id: dto.job_id } });
      if (!job) {
        throw new NotFoundException({ message: 'Job posting not found' });
      }

      const worker = await this.workerRepository.findOne({ where: { user: { _id: user._id } }, relations: ['user'] });
      if (!worker) {
        throw new NotFoundException({ message: 'Worker profile not found for this user' });
      }

      // Prevent duplicate applications for the same job and worker
      const existing = await this.applicationRepository.findOne({ where: { job_id: job.job_id, worker_id: worker.id } });
      if (existing) {
        throw BadRequestException.RESOURCE_ALREADY_EXISTS('You have already applied to this job');
      }

      const application = this.applicationRepository.create({
        job,
        job_id: job.job_id,
        worker,
        worker_id: worker.id,
        status: JobApplicationStatus.APPLIED,
        cover_letter: dto.cover_letter,
      });

      return await this.applicationRepository.save(application);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async update(user: User, id: string, dto: UpdateJobApplicationDto): Promise<JobApplication> {
    try {
      const application = await this.applicationRepository.findOne({
        where: { application_id: id },
        relations: ['worker', 'worker.user', 'job', 'job.employer', 'job.employer.user'],
      });
      if (!application) {
        throw new NotFoundException({ message: 'Job application not found' });
      }

      const isApplicant = !!application.worker?.user && application.worker.user._id === user._id;
      const isEmployerOwner = !!application.job?.employer?.user && application.job.employer.user._id === user._id;

      // Reglas de autorización:
      // - cover_letter: solo el postulante puede modificar su carta.
      // - status:
      //     - 'withdrawn': solo el postulante puede retirar su postulación.
      //     - otros estados (shortlisted, interview, rejected, hired): solo el empleador propietario del job.

      if (dto.cover_letter !== undefined) {
        if (!isApplicant) {
          throw new UnauthorizedException({ message: 'Only the applicant can update cover letter' });
        }
        application.cover_letter = dto.cover_letter;
      }

      if (dto.status !== undefined) {
        const status = dto.status as any;
        if (status === 'withdrawn') {
          if (!isApplicant) {
            throw new UnauthorizedException({ message: 'Only the applicant can withdraw their application' });
          }
          application.status = status;
        } else {
          if (!isEmployerOwner) {
            throw new UnauthorizedException({ message: 'Only the job owner employer can update application status' });
          }
          application.status = status;
        }
      }

      return await this.applicationRepository.save(application);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async remove(user: User, id: string): Promise<void> {
    try {
      const application = await this.applicationRepository.findOne({
        where: { application_id: id },
        relations: ['worker', 'worker.user', 'job', 'job.employer', 'job.employer.user'],
      });
      if (!application) {
        throw new NotFoundException({ message: 'Job application not found' });
      }

      const isApplicant = !!application.worker?.user && application.worker.user._id === user._id;
      const isEmployerOwner = !!application.job?.employer?.user && application.job.employer.user._id === user._id;

      // Permitir borrar la postulación si:
      // - Es el postulante (trabajador) dueño de la aplicación
      // - Es el empleador dueño del job al que se postuló
      if (!isApplicant && !isEmployerOwner) {
        throw new UnauthorizedException({ message: 'You are not allowed to delete this application' });
      }

      await this.applicationRepository.remove(application);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async listForJob(user: User, jobId: string): Promise<JobApplication[]> {
    try {
      const job = await this.jobRepository.findOne({ where: { job_id: jobId }, relations: ['employer', 'employer.user'] });
      if (!job) {
        throw new NotFoundException({ message: 'Job posting not found' });
      }

      // Solo el empleador dueño del job puede consultar las postulaciones
      if (!job.employer?.user || job.employer.user._id !== user._id) {
        throw new UnauthorizedException({ message: 'You are not allowed to view applications for this job' });
      }

      return await this.applicationRepository.find({
        where: { job_id: job.job_id },
        relations: ['worker', 'worker.user'],
        order: { created_at: 'DESC' as any },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async listMine(user: User): Promise<JobApplication[]> {
    try {
      if (user.user_type !== UserType.WORKER) {
        throw new UnauthorizedException({ message: 'Only workers can view their applications' });
      }

      const worker = await this.workerRepository.findOne({ where: { user: { _id: user._id } }, relations: ['user'] });
      if (!worker) {
        throw new NotFoundException({ message: 'Worker profile not found for this user' });
      }

      return await this.applicationRepository.find({
        where: { worker_id: worker.id },
        order: { created_at: 'DESC' as any },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
