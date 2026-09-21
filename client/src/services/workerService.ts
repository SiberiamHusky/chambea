import api from './api';

export interface CreateWorkerProfilePayload {
  bio: string;
  years_of_experience: number;
  availability_status: string;
  rate_type: string; // e.g., 'HOURLY' | 'FIXED'
  rate_amount: number;
  rate_currency: string; // e.g., 'USD' | 'EUR' | 'VES'
  base_location_address?: string;
  identity_document_type_enum: 'V' | 'E' | 'P' | 'G';
  identity_document_number: string;
  cv_url?: string;
}

export interface WorkerProfile {
  id: string;
  bio: string;
  years_of_experience: number;
  availability_status: string;
  rate_type: string;
  rate_amount: number;
  rate_currency: string;
  base_location_address?: string;
  identity_document_type_enum: 'V' | 'E' | 'P' | 'G';
  identity_document_number: string;
  identity_verified_status: boolean;
  cv_url?: string;
}

export interface WorkerProfileWithUser extends WorkerProfile {
  user?: {
    _id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface UpdateWorkerProfilePayload {
  bio?: string;
  years_of_experience?: number;
  availability_status?: string;
  rate_type?: string;
  rate_amount?: number;
  rate_currency?: string;
  base_location_address?: string;
  identity_document_type_enum?: 'V' | 'E' | 'P' | 'G';
  identity_document_number?: string;
  cv_url?: string;
}

export const workerService = {
  createProfile: async (payload: CreateWorkerProfilePayload) => {
    const response = await api.post('/api/workers', payload);
    return response.data;
  },
  uploadCv: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/workers/me/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  updateMyProfile: async (payload: UpdateWorkerProfilePayload) => {
    const response = await api.patch('/api/workers/me', payload);
    return response.data as WorkerProfile;
  },
  getMyProfile: async (): Promise<WorkerProfile | null> => {
    try {
      const response = await api.get('/api/workers/me');
      return response.data as WorkerProfile;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },
  getWorkerByUserId: async (userId: string): Promise<WorkerProfileWithUser | null> => {
    try {
      const response = await api.get(`/api/workers/by-user/${userId}`);
      return response.data as WorkerProfileWithUser;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },
};

export default workerService;