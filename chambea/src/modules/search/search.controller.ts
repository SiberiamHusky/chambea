import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Buscar trabajos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trabajos que coinciden con los criterios de búsqueda',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              job_id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              title: { type: 'string', example: 'Desarrollador Full Stack' },
              description: { type: 'string', example: 'Buscamos desarrollador con experiencia en React y Node.js' },
              salary: { type: 'number', example: 45000 },
              job_type: { type: 'string', example: 'remoto' },
              category: { type: 'string', example: 'Tecnología' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  async searchJobs(@Query() searchDto: SearchJobsDto) {
    return this.searchService.searchJobs(searchDto);
  }

  @Get('jobs/authenticated')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar trabajos con filtros (requiere autenticación)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de trabajos que coinciden con los criterios de búsqueda',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              job_id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              title: { type: 'string', example: 'Desarrollador Full Stack' },
              description: { type: 'string', example: 'Buscamos desarrollador con experiencia en React y Node.js' },
              salary: { type: 'number', example: 45000 },
              job_type: { type: 'string', example: 'remoto' },
              category: { type: 'string', example: 'Tecnología' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  async searchJobsAuthenticated(@Query() searchDto: SearchJobsDto) {
    return this.searchService.searchJobs(searchDto);
  }
}
