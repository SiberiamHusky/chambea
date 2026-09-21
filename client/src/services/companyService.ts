import api from './api';
import type { Company } from './employerService';

const companyService = {
  listAll: async (): Promise<Company[]> => {
    const response = await api.get('/companies');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? (data as Company[]) : [];
  },
};

export default companyService;