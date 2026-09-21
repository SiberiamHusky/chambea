import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Company } from '../../shared/entities';
import { InternalServerErrorException, NotFoundException } from '../../exceptions';
import { JobPosting } from '../jobs/job-posting.entity';

export interface AdminCompanySummary {
  company_id: string;
  company_name: string;
  company_rif: string;
  industry: string;
  company_size: string;
  verification_status: string;
  company_email?: string;
  company_phone?: string;
  created_at: Date;
  updated_at: Date;
  job_count: number;
  active_job_count: number;
  latest_job_at?: Date | null;
}

export interface AdminOverview {
  totals: {
    companies: number;
    jobs: number;
    activeJobs: number;
    jobsWithoutCompany: number;
  };
  recentCompanies: AdminCompanySummary[];
  recentJobs: JobPosting[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,
  ) {}

  private buildCompanySummaries(companies: Company[], jobs: JobPosting[]): AdminCompanySummary[] {
    const jobsByCompany = new Map<string, JobPosting[]>();

    jobs.forEach((job) => {
      if (!job.company_id) return;
      const items = jobsByCompany.get(job.company_id) ?? [];
      items.push(job);
      jobsByCompany.set(job.company_id, items);
    });

    return companies.map((company) => {
      const companyJobs = jobsByCompany.get(company.company_id) ?? [];
      const latestJob = companyJobs.length
        ? companyJobs.reduce((latest, current) => {
            if (!latest) return current;
            return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
          }, null as JobPosting | null)
        : null;

      return {
        company_id: company.company_id,
        company_name: company.company_name,
        company_rif: company.company_rif,
        industry: company.industry,
        company_size: company.company_size,
        verification_status: company.verification_status,
        company_email: company.company_email,
        company_phone: company.company_phone,
        created_at: company.created_at,
        updated_at: company.updated_at,
        job_count: companyJobs.length,
        active_job_count: companyJobs.filter((job) => job.is_active).length,
        latest_job_at: latestJob?.created_at ?? null,
      };
    });
  }

  async getOverview(): Promise<AdminOverview> {
    try {
      const [companies, jobs] = await Promise.all([
        this.companyRepository.find({ order: { created_at: 'DESC' } }),
        this.jobRepository.find({ order: { created_at: 'DESC' } }),
      ]);

      const companySummaries = this.buildCompanySummaries(companies, jobs);

      return {
        totals: {
          companies: companies.length,
          jobs: jobs.length,
          activeJobs: jobs.filter((job) => job.is_active).length,
          jobsWithoutCompany: jobs.filter((job) => !job.company_id).length,
        },
        recentCompanies: companySummaries.slice(0, 6),
        recentJobs: jobs.slice(0, 10),
      };
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async getCompanies(): Promise<AdminCompanySummary[]> {
    try {
      const [companies, jobs] = await Promise.all([
        this.companyRepository.find({ order: { created_at: 'DESC' } }),
        this.jobRepository.find({ order: { created_at: 'DESC' } }),
      ]);

      return this.buildCompanySummaries(companies, jobs);
    } catch (error) {
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }

  async getCompanyJobs(companyId: string): Promise<{ company: Company; jobs: JobPosting[] }> {
    try {
      const company = await this.companyRepository.findOne({ where: { company_id: companyId } });

      if (!company) {
        throw new NotFoundException({ message: 'Company not found' });
      }

      const jobs = await this.jobRepository.find({
        where: { company_id: companyId },
        order: { created_at: 'DESC' },
      });

      return { company, jobs };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw InternalServerErrorException.INTERNAL_SERVER_ERROR(error);
    }
  }
}
