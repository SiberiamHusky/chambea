import api from './api';

export interface AdminCompanySummary {
  company_id: string;
  company_name: string;
  company_rif: string;
  industry: string;
  company_size: string;
  verification_status: string;
  company_email?: string;
  company_phone?: string;
  created_at: string;
  updated_at: string;
  job_count: number;
  active_job_count: number;
  latest_job_at?: string | null;
}

export interface AdminJob {
  job_id: string;
  title: string;
  description: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  rate_type: 'hourly' | 'fixed';
  currency: 'USD' | 'EUR' | 'VES';
  budget_min?: number;
  budget_max?: number;
  is_active: boolean;
  company_id?: string;
  created_at: string;
  employer?: {
    employer_id: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

export interface AdminOverview {
  totals: {
    companies: number;
    jobs: number;
    activeJobs: number;
    jobsWithoutCompany: number;
  };
  recentCompanies: AdminCompanySummary[];
  recentJobs: AdminJob[];
}

export interface AdminCompanyJobsResponse {
  company: {
    company_id: string;
    company_name: string;
    company_rif: string;
    company_description?: string;
    company_email?: string;
    company_phone?: string;
    company_website?: string;
    verification_status: string;
  };
  jobs: AdminJob[];
}

const adminService = {
  getOverview: async (): Promise<AdminOverview> => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getCompanies: async (): Promise<AdminCompanySummary[]> => {
    const response = await api.get('/admin/companies');
    return response.data;
  },

  getCompanyJobs: async (companyId: string): Promise<AdminCompanyJobsResponse> => {
    const response = await api.get(`/admin/companies/${companyId}/jobs`);
    return response.data;
  },
};

export default adminService;
