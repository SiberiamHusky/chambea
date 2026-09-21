import api from './api';
import type { JobPosting, SearchFilters, SearchResponse } from '../types';

export interface CreateJobAddressPayload {
  country: string;
  state: string;
  city: string;
  address_line: string;
  postal_code?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  rate_type: 'hourly' | 'fixed';
  currency: 'USD' | 'EUR' | 'VES';
  budget_min?: number;
  budget_max?: number;
  is_active?: boolean;
  employer_id: string;
  company_id?: string;
  job_address?: CreateJobAddressPayload;
  // Campos adicionales del cliente
  category?: string;
}

export const jobService = {
  // Buscar trabajos (público)
  searchJobs: async (filters: SearchFilters = {}): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/search/jobs?${params.toString()}`);
    return response.data;
  },

  // Buscar trabajos (autenticado)
  searchJobsAuthenticated: async (filters: SearchFilters = {}): Promise<SearchResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/search/jobs/authenticated?${params.toString()}`);
    return response.data;
  },

  // Obtener trabajo por ID
  getJobById: async (id: string): Promise<JobPosting> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Crear nuevo trabajo (solo empleadores)
  createJob: async (jobData: CreateJobPayload): Promise<JobPosting> => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Actualizar trabajo
  updateJob: async (id: string, jobData: Partial<JobPosting>): Promise<JobPosting> => {
    const response = await api.patch(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Eliminar trabajo
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  // Obtener trabajos del empleador actual
  getMyJobs: async (): Promise<JobPosting[]> => {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  },
};

export default jobService;