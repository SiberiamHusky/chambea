// Tipos para autenticación
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'worker' | 'employer' | 'admin' | 'pending';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpVerificationResponse {
  isValid: boolean;
}

export interface OtpResendResponse {
  message: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

// Tipos para trabajos
export interface JobPosting {
  job_id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  work_mode?: 'remote' | 'hybrid' | 'onsite';
  rate_type?: 'hourly' | 'fixed';
  currency?: 'USD' | 'EUR' | 'VES';
  budget_min?: number;
  budget_max?: number;
  salaryMin?: number;
  salaryMax?: number;
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer?: {
    employer_id: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
    company?: {
      company_id: string;
      company_name: string;
      company_logo_url?: string;
    };
  };
  company?: {
    company_id: string;
    company_name: string;
    company_logo_url?: string;
  };
}

// Tipos para búsqueda
export interface SearchFilters {
  query?: string;
  location?: string;
  category?: string;
  minSalary?: number;
  maxSalary?: number;
  jobType?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  data: JobPosting[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tipos para aplicaciones
export interface Application {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  jobPosting: JobPosting;
  worker: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

// Tipos generales
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
