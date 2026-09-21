import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JobPosting } from '../jobs/job-posting.entity';
import { SearchJobsDto } from './dto/search-jobs.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobRepository: Repository<JobPosting>,
  ) {}

  async searchJobs(searchDto: SearchJobsDto) {
    const { query, location, category, minSalary, maxSalary, jobType, page = 1, limit = 10 } = searchDto;

    // Construir la consulta base
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.employer', 'employer')
      // Incluir el usuario del empleador para poder identificar propietario en el cliente
      .leftJoinAndSelect('employer.user', 'employerUser')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.job_address', 'address');

    // Aplicar filtros si existen
    if (query) {
      queryBuilder.andWhere('(job.title LIKE :query OR job.description LIKE :query)', { query: `%${query}%` });
    }

    if (location) {
      queryBuilder.andWhere('(address.city LIKE :location OR address.state LIKE :location OR address.country LIKE :location)', {
        location: `%${location}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('job.category = :category', { category });
    }

    if (minSalary) {
      queryBuilder.andWhere('job.salary >= :minSalary', { minSalary });
    }

    if (maxSalary) {
      queryBuilder.andWhere('job.salary <= :maxSalary', { maxSalary });
    }

    if (jobType) {
      queryBuilder.andWhere('job.job_type = :jobType', { jobType });
    }

    // Aplicar paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('job.created_at', 'DESC');

    // Ejecutar la consulta
    const [jobs, total] = await queryBuilder.getManyAndCount();

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
