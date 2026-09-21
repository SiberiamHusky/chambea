import api from './api';

export interface CreateEmployerProfilePayload {
  employer_type: 'individual' | 'company';
  bio?: string;
  years_as_employer?: number;
}

// Actualización del perfil de empleador
export interface UpdateEmployerProfilePayload {
  employer_type?: 'individual' | 'company';
  bio?: string;
  years_as_employer?: number;
  is_verified?: boolean;
  company_id?: string;
}

// Perfil de empleador (lectura)
export interface EmployerProfile {
  employer_id: string;
  employer_type: 'individual' | 'company';
  bio?: string;
  years_as_employer?: number;
  company?: Company | null;
}

export interface CreateCompanyAddressPayload {
  country: string;
  state: string;
  city: string;
  address_line: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateCompanyPayload {
  company_name: string;
  company_rif: string;
  company_description?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  industry:
    | 'technology'
    | 'healthcare'
    | 'finance'
    | 'education'
    | 'retail'
    | 'manufacturing'
    | 'construction'
    | 'hospitality'
    | 'transportation'
    | 'agriculture'
    | 'energy'
    | 'media'
    | 'real_estate'
    | 'consulting'
    | 'non_profit'
    | 'government'
    | 'other';
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  employee_count?: number;
  founded_year?: number;
  company_logo_url?: string;
  company_address?: CreateCompanyAddressPayload;
}

// Actualización de empresa
export interface UpdateCompanyPayload {
  company_name?: string;
  company_rif?: string;
  company_description?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  industry?:
    | 'technology'
    | 'healthcare'
    | 'finance'
    | 'education'
    | 'retail'
    | 'manufacturing'
    | 'construction'
    | 'hospitality'
    | 'transportation'
    | 'agriculture'
    | 'energy'
    | 'media'
    | 'real_estate'
    | 'consulting'
    | 'non_profit'
    | 'government'
    | 'other';
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  employee_count?: number;
  founded_year?: number;
  company_logo_url?: string | null;
  company_address?: CreateCompanyAddressPayload;
  company_address_id?: string;
}

// Empresa (lectura)
export interface CompanyAddress {
  country: string;
  state: string;
  city: string;
  address_line: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface Company {
  company_id: string;
  company_name: string;
  company_rif: string;
  company_description?: string;
  company_website?: string;
  company_phone?: string;
  company_email?: string;
  industry:
    | 'technology'
    | 'healthcare'
    | 'finance'
    | 'education'
    | 'retail'
    | 'manufacturing'
    | 'construction'
    | 'hospitality'
    | 'transportation'
    | 'agriculture'
    | 'energy'
    | 'media'
    | 'real_estate'
    | 'consulting'
    | 'non_profit'
    | 'government'
    | 'other';
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  employee_count?: number;
  founded_year?: number;
  company_logo_url?: string;
  company_address?: CompanyAddress;
}

export const employerService = {
  createProfile: async (payload: CreateEmployerProfilePayload) => {
    const response = await api.post('/employer', payload);
    return response.data;
  },
  updateProfile: async (employerId: string, payload: UpdateEmployerProfilePayload) => {
    const response = await api.patch(`/employer/${employerId}`, payload);
    return response.data as EmployerProfile;
  },
  createCompany: async (payload: CreateCompanyPayload) => {
    const response = await api.post('/employer/companies', payload);
    return response.data;
  },
  updateCompany: async (companyId: string, payload: UpdateCompanyPayload) => {
    const response = await api.patch(`/employer/companies/${companyId}`, payload);
    return response.data as Company;
  },
  // Subir logo de empresa
  uploadCompanyLogo: async (companyId: string, file: File): Promise<Company> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post(`/employer/companies/${companyId}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as Company;
  },
  // Vincular una empresa existente al employer autenticado
  attachCompany: async (companyId: string) => {
    const response = await api.post(`/employer/companies/attach/${companyId}`);
    return response.data;
  },
  // Obtener perfil del empleador autenticado
  getMyProfile: async (): Promise<EmployerProfile> => {
    const response = await api.get('/employer/me');
    return response.data;
  },
  // Obtener empresa del empleador autenticado (intenta endpoint específico y luego listado)
  getMyCompany: async (): Promise<Company | null> => {
    try {
      const r1 = await api.get('/employer/companies/my');
      const data = r1.data;
      // Puede venir como objeto directo o envuelto
      return (data?.data ?? data) as Company;
    } catch (_err) {
      try {
        const r2 = await api.get('/employer/companies');
        const list = (r2.data?.data ?? r2.data) as Company[];
        if (Array.isArray(list) && list.length > 0) return list[0];
        return null;
      } catch (_err2) {
        return null;
      }
    }
  },
  // Obtener perfil de empleador por userId (incluye company si existe)
  getEmployerByUserId: async (userId: string): Promise<EmployerProfile> => {
    const response = await api.get(`/employer/by-user/${userId}`);
    return response.data as EmployerProfile;
  },
};

export default employerService;