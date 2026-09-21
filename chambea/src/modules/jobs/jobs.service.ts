import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Address, Company } from '../../shared/entities';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '../../exceptions';
import { CreateJobPostingDto, UpdateJobPostingDto } from './dtos';
import { Employer } from '../employer/employer.entity';
import { JobPosting } from './job-posting.entity';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { User } from '../user/user.entity';
// eslint-disable-next-line sort-imports-es6-autofix/sort-imports-es6
import { GetJobsQueryDto } from './dtos/get-jobs.query.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,
    @InjectRepository(Employer)
    private readonly employerRepository: Repository<Employer>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(user: User, dto: CreateJobPostingDto): Promise<JobPosting> {
    try {
      // Validar employer y propiedad
      const employer = await this.employerRepository.findOne({ where: { employer_id: dto.employer_id }, relations: ['user'] });
      if (!employer) {
        throw new NotFoundException({ message: 'Employer not found' });
      }
      if (!employer.user || employer.user._id !== user._id) {
        throw new UnauthorizedException({ message: 'You are not the owner of this employer' });
      }

      // Validar company si viene
      let company: Company = null;
      if (dto.company_id) {
        company = await this.companyRepository.findOne({ where: { company_id: dto.company_id } });
        if (!company) {
          throw new NotFoundException({ message: 'Company not found' });
        }
      }

      // Crear dirección si viene
      let jobAddress: Address = null;
      if (dto.job_address) {
        jobAddress = this.addressRepository.create(dto.job_address);
        jobAddress = await this.addressRepository.save(jobAddress);
      }

      // Validaciones simples de presupuesto
      if (dto.budget_min && dto.budget_max && Number(dto.budget_min) > Number(dto.budget_max)) {
        throw BadRequestException.INVALID_INPUT('budget_min cannot be greater than budget_max');
      }

      const job = this.jobRepository.create({
        title: dto.title,
        description: dto.description,
        skills: dto.skills,
        work_mode: dto.work_mode,
        rate_type: dto.rate_type,
        budget_min: dto.budget_min,
        budget_max: dto.budget_max,
        currency: dto.currency,
        is_active: dto.is_active ?? true,
        employer,
        employer_id: employer.employer_id,
        company,
        company_id: company?.company_id,
        job_address: jobAddress,
        job_address_id: jobAddress?.address_id,
      });

      return await this.jobRepository.save(job);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAll(query: GetJobsQueryDto): Promise<JobPosting[]> {
    try {
      const { page = 1, limit = 20, is_active, work_mode, rate_type, currency, employer_id, company_id, search, skills } = query || {};

      const qb = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.employer', 'employer')
        .leftJoinAndSelect('employer.user', 'employerUser')
        .leftJoinAndSelect('job.company', 'company')
        .leftJoinAndSelect('job.job_address', 'address');

      if (is_active !== undefined) {
        qb.andWhere('job.is_active = :is_active', { is_active });
      }
      if (work_mode !== undefined) {
        qb.andWhere('job.work_mode = :work_mode', { work_mode });
      }
      if (rate_type !== undefined) {
        qb.andWhere('job.rate_type = :rate_type', { rate_type });
      }
      if (currency !== undefined) {
        qb.andWhere('job.currency = :currency', { currency });
      }
      if (employer_id) {
        qb.andWhere('job.employer_id = :employer_id', { employer_id });
      }
      if (company_id) {
        qb.andWhere('job.company_id = :company_id', { company_id });
      }
      if (search) {
        qb.andWhere('(job.title LIKE :search OR job.description LIKE :search)', { search: `%${search}%` });
      }
      if (skills && skills.length > 0) {
        const skillConditions: string[] = [];
        const params: Record<string, string> = {};
        skills.forEach((skill, idx) => {
          const key = `skill${idx}`;
          skillConditions.push(`job.skills LIKE :${key}`);
          params[key] = `%${skill}%`;
        });
        qb.andWhere(skillConditions.join(' OR '), params);
      }

      qb.orderBy('job.created_at', 'DESC')
        .take(limit)
        .skip((page - 1) * limit);

      return await qb.getMany();
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findOne(id: string): Promise<JobPosting> {
    try {
      const job = await this.jobRepository.findOne({
        where: { job_id: id },
        relations: ['employer', 'employer.user', 'company', 'job_address'],
      });
      if (!job) {
        throw new NotFoundException({ message: 'Job posting not found' });
      }
      return job;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async update(user: User, id: string, dto: UpdateJobPostingDto): Promise<JobPosting> {
    try {
      const job = await this.findOne(id);

      // Autorización de propietario
      if (!job.employer?.user || job.employer.user._id !== user._id) {
        throw new UnauthorizedException({ message: 'You are not allowed to update this job' });
      }

      // Presupuesto
      if (dto.budget_min !== undefined) {
        job.budget_min = dto.budget_min as any;
      }
      if (dto.budget_max !== undefined) {
        job.budget_max = dto.budget_max as any;
      }
      if (job.budget_min && job.budget_max && Number(job.budget_min) > Number(job.budget_max)) {
        throw BadRequestException.INVALID_INPUT('budget_min cannot be greater than budget_max');
      }

      // Company
      if (dto.company_id) {
        const company = await this.companyRepository.findOne({ where: { company_id: dto.company_id } });
        if (!company) {
          throw new NotFoundException({ message: 'Company not found' });
        }
        job.company = company;
        job.company_id = company.company_id;
      }

      // Address
      if (dto.job_address) {
        if (job.job_address) {
          Object.assign(job.job_address, dto.job_address);
          await this.addressRepository.save(job.job_address);
        } else {
          const newAddress = this.addressRepository.create(dto.job_address);
          job.job_address = await this.addressRepository.save(newAddress);
          job.job_address_id = job.job_address.address_id;
        }
      }

      // Campos simples
      if (dto.title !== undefined) {
        job.title = dto.title;
      }
      if (dto.description !== undefined) {
        job.description = dto.description;
      }
      if (dto.skills !== undefined) {
        job.skills = dto.skills;
      }
      if (dto.work_mode !== undefined) {
        job.work_mode = dto.work_mode;
      }
      if (dto.rate_type !== undefined) {
        job.rate_type = dto.rate_type;
      }
      if (dto.currency !== undefined) {
        job.currency = dto.currency;
      }
      if (dto.is_active !== undefined) {
        job.is_active = dto.is_active;
      }

      return await this.jobRepository.save(job);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async remove(user: User, id: string): Promise<void> {
    try {
      const job = await this.findOne(id);

      // Autorización de propietario
      if (!job.employer?.user || job.employer.user._id !== user._id) {
        throw new UnauthorizedException({ message: 'You are not allowed to delete this job' });
      }

      await this.jobRepository.remove(job);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async findAllMine(user: User): Promise<JobPosting[]> {
    try {
      // Resolver employer del usuario autenticado
      const employer = await this.employerRepository.findOne({ where: { user: { _id: user._id } } });
      if (!employer) {
        return [];
      }

      // Reutilizar el método de listado con filtro por employer_id
      return await this.findAll({ employer_id: employer.employer_id, page: 1, limit: 100 } as GetJobsQueryDto);
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
