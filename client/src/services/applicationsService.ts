import api from './api';

export interface JobRef {
  id: string;
  title: string;
  company_name?: string;
}

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface ApplicationItem {
  id: string;
  job: JobRef;
  status: ApplicationStatus;
  applied_at?: string;
  cover_letter?: string;
}

export interface EmployerApplicationItem {
  id: string;
  status: ApplicationStatus;
  applied_at?: string;
  cover_letter?: string;
  worker?: {
    id?: string;
    user_id?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export type EmployerActionStatus = 'shortlisted' | 'interview' | 'rejected' | 'hired' | 'withdrawn';

const applicationsService = {
  async applyToJob(jobId: string, coverLetter?: string) {
    try {
      const res = await api.post(`/applications`, { job_id: jobId, cover_letter: coverLetter });
      return res.data;
    } catch (err) {
      console.error('Error applying to job', err);
      throw err;
    }
  },

  async listMyApplications(): Promise<ApplicationItem[]> {
    try {
      const res = await api.get(`/applications/my`);
      return (res.data || []).map((a: any) => {
        const job = a.job || {};
        const companyName = job.company?.company_name || a.company_name;
        return {
          id: a.application_id ?? a.id,
          status: (a.status ?? 'PENDING') as ApplicationStatus,
          applied_at: a.created_at,
          cover_letter: a.cover_letter,
          job: {
            id: job.job_id ?? a.job_id,
            title: job.title ?? a.title,
            company_name: companyName,
          },
        } as ApplicationItem;
      });
    } catch (err) {
      console.error('Error fetching my applications', err);
      return [];
    }
  },

  async withdrawApplication(applicationId: string) {
    try {
      const res = await api.post(`/applications/${applicationId}/withdraw`);
      return res.data;
    } catch (err) {
      console.error('Error withdrawing application', err);
      throw err;
    }
  },

  async deleteApplication(applicationId: string) {
    try {
      const res = await api.delete(`/applications/${applicationId}`);
      return res.data;
    } catch (err) {
      console.error('Error deleting application', err);
      throw err;
    }
  },

  async listApplicationsByJob(jobId: string): Promise<EmployerApplicationItem[]> {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      // Normalizamos mínimamente la estructura para la vista del empleador
      return (res.data || []).map((a: any) => {
        const first = a.worker?.user?.first_name;
        const last = a.worker?.user?.last_name;
        const composedName = [first, last].filter(Boolean).join(' ') || a.worker?.user?.full_name || a.worker?.user?.name || a.worker?.user?.username;
        return {
          id: a.application_id ?? a.id,
          status: (a.status ?? 'PENDING') as ApplicationStatus,
          applied_at: a.created_at,
          cover_letter: a.cover_letter,
          worker: {
            id: a.worker?.id,
            user_id: a.worker?.user?._id ?? a.worker?.user?.id,
            first_name: first,
            last_name: last,
            name: composedName,
            email: a.worker?.user?.email,
          },
        } as EmployerApplicationItem;
      });
    } catch (err) {
      console.error('Error fetching applications for job', err);
      return [];
    }
  },

  async updateApplicationStatus(applicationId: string, status: EmployerActionStatus) {
    try {
      const res = await api.patch(`/applications/${applicationId}`, { status });
      return res.data;
    } catch (err) {
      console.error('Error updating application status', err);
      throw err;
    }
  },
};

export default applicationsService;