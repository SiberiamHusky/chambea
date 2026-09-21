import api from './api';

export interface JobSummary {
  id: string;
  title: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  created_at?: string;
  work_mode?: 'remote' | 'hybrid' | 'onsite';
}

export interface JobDetail extends JobSummary {
  description?: string;
  requirements?: string[];
  skills?: string[];
  employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERNSHIP';
  industry?: string;
  rate_type?: 'hourly' | 'fixed';
  currency?: 'USD' | 'EUR' | 'VES';
  budget_min?: number;
  budget_max?: number;
  is_active?: boolean;
  updated_at?: string;
  employer_id?: string;
  owner_user_id?: string;
}

const jobsService = {
  translateIndustry(ind?: string): string | undefined {
    if (!ind) return undefined;
    const key = String(ind).toLowerCase();
    const map: Record<string, string> = {
      technology: 'Tecnología',
      healthcare: 'Salud',
      finance: 'Finanzas',
      education: 'Educación',
      retail: 'Retail',
      manufacturing: 'Manufactura',
      construction: 'Construcción',
      hospitality: 'Hospitalidad',
      transportation: 'Transporte',
      agriculture: 'Agricultura',
      energy: 'Energía',
      media: 'Medios',
      real_estate: 'Bienes raíces',
      consulting: 'Consultoría',
      non_profit: 'Sin fines de lucro',
      government: 'Gobierno',
      other: 'Otro',
    };
    return map[key] ?? ind;
  },
  formatLocation(address?: {
    country?: string;
    state?: string;
    city?: string;
    address_line?: string;
    postal_code?: string;
  }): string | undefined {
    if (!address) return undefined;
    const parts = [address.city, address.state, address.country].filter(Boolean);
    const line = address.address_line ? ` - ${address.address_line}` : '';
    return parts.length ? `${parts.join(', ')}${line}` : undefined;
  },

  formatSalaryRange(min?: number, max?: number, currency?: string, rateType?: 'hourly' | 'fixed'): string | undefined {
    if (!currency) return undefined;
    const toNum = (v: unknown): number | undefined => {
      if (v === null || v === undefined) return undefined;
      const n = typeof v === 'number' ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };
    const fmt = (v?: number) => (typeof v === 'number' ? v.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : undefined);
    const nMin = toNum(min);
    const nMax = toNum(max);
    const minStr = fmt(nMin);
    const maxStr = fmt(nMax);
    const base = minStr && maxStr
      ? `${minStr}–${maxStr} ${currency}`
      : minStr
      ? `${minStr} ${currency}`
      : maxStr
      ? `${maxStr} ${currency}`
      : undefined;
    if (!base) return undefined;
    const freq = rateType === 'hourly' ? 'por hora' : rateType === 'fixed' ? 'monto fijo' : undefined;
    return freq ? `${base} ${freq}` : base;
  },

  toJobSummary(p: any): JobSummary {
    const id = p.job_id ?? p.id;
    const company_name = p.company?.company_name ?? p.company_name;
    // Fallback: si la oferta no tiene dirección propia, usar la de la empresa
    const address = p.job_address ?? p.company?.company_address;
    const location = jobsService.formatLocation(address);
    const salary_range = jobsService.formatSalaryRange(p.budget_min, p.budget_max, p.currency, p.rate_type);
    const created_at = p.created_at ? new Date(p.created_at).toISOString() : undefined;
    const work_mode = p.work_mode ?? p.workMode;
    return { id, title: p.title, company_name, location, salary_range, created_at, work_mode };
  },

  toJobDetail(p: any): JobDetail {
    const base = jobsService.toJobSummary(p);
    const industry = jobsService.translateIndustry(p.company?.industry ?? p.industry);
    const skills = p.skills ?? [];
    const employment_type = p.employment_type;
    const rate_type = p.rate_type;
    const currency = p.currency;
    const description = p.description;
    const requirements = p.requirements ?? [];
    const budget_min = typeof p.budget_min === 'number' ? p.budget_min : (p.budget_min != null ? Number(p.budget_min) : undefined);
    const budget_max = typeof p.budget_max === 'number' ? p.budget_max : (p.budget_max != null ? Number(p.budget_max) : undefined);
    const is_active = typeof p.is_active === 'boolean' ? p.is_active : undefined;
    const updated_at = p.updated_at ? new Date(p.updated_at).toISOString() : undefined;
    const employer_id = p.employer_id ?? p.employer?.employer_id;
    const owner_user_id = p.employer?.user?._id ?? p.employer?.user?.id ?? p.owner_user_id;
    return { ...base, description, requirements, skills, employment_type, industry, rate_type, currency, budget_min, budget_max, is_active, updated_at, employer_id, owner_user_id };
  },

  async listJobs(): Promise<JobSummary[]> {
    try {
      const res = await api.get('/jobs');
      const data = Array.isArray(res.data) ? res.data : [];
      return data.map((p: any) => jobsService.toJobSummary(p));
    } catch (err) {
      console.error('Error fetching jobs', err);
      return [];
    }
  },

  async getJobById(id: string): Promise<JobDetail | null> {
    try {
      const res = await api.get(`/jobs/${id}`);
      return res.data ? jobsService.toJobDetail(res.data) : null;
    } catch (err) {
      console.error('Error fetching job detail', err);
      return null;
    }
  },
};

export default jobsService;