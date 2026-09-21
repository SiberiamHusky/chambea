import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { AdminOverview, AdminService, AdminCompanySummary } from './admin.service';
import { JobPosting } from '../jobs/job-posting.entity';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard, AdminAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOkResponse({ description: 'Resumen general del panel de administración' })
  async getOverview(): Promise<AdminOverview> {
    return this.adminService.getOverview();
  }

  @Get('companies')
  @ApiOkResponse({ description: 'Listado de empresas para administración' })
  async getCompanies(): Promise<AdminCompanySummary[]> {
    return this.adminService.getCompanies();
  }

  @Get('companies/:id/jobs')
  @ApiOkResponse({ description: 'Empleos registrados por una empresa específica' })
  async getCompanyJobs(@Param('id') id: string): Promise<{ company: any; jobs: JobPosting[] }> {
    return this.adminService.getCompanyJobs(id);
  }
}
