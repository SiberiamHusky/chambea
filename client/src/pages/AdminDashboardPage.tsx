import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import adminService, { type AdminCompanyJobsResponse, type AdminCompanySummary, type AdminOverview } from '../services/adminService';

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatWorkMode = (value: 'remote' | 'hybrid' | 'onsite') => {
  if (value === 'remote') return 'Remoto';
  if (value === 'hybrid') return 'Hibrido';
  return 'Presencial';
};

const formatRateType = (value: 'hourly' | 'fixed') => {
  if (value === 'hourly') return 'Por hora';
  return 'Monto fijo';
};

const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [companies, setCompanies] = useState<AdminCompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companyJobs, setCompanyJobs] = useState<AdminCompanyJobsResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [companyJobsLoading, setCompanyJobsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewData, companiesData] = await Promise.all([
          adminService.getOverview(),
          adminService.getCompanies(),
        ]);

        if (!active) return;

        setOverview(overviewData);
        setCompanies(companiesData);

        if (companiesData.length > 0) {
          setSelectedCompanyId(companiesData[0].company_id);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || 'No se pudo cargar el panel de administración.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCompanyJobs = async () => {
      if (!selectedCompanyId) {
        setCompanyJobs(null);
        return;
      }

      setCompanyJobsLoading(true);
      try {
        const response = await adminService.getCompanyJobs(selectedCompanyId);
        if (!active) return;
        setCompanyJobs(response);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || 'No se pudieron cargar los empleos de la empresa.');
      } finally {
        if (active) setCompanyJobsLoading(false);
      }
    };

    loadCompanyJobs();

    return () => {
      active = false;
    };
  }, [selectedCompanyId]);

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return companies;

    return companies.filter((company) =>
      [company.company_name, company.company_rif, company.industry]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [companies, query]);

  useEffect(() => {
    if (!filteredCompanies.length) {
      setSelectedCompanyId('');
      setCompanyJobs(null);
      return;
    }

    const selectedStillExists = filteredCompanies.some((company) => company.company_id === selectedCompanyId);
    if (!selectedStillExists) {
      setSelectedCompanyId(filteredCompanies[0].company_id);
    }
  }, [filteredCompanies, selectedCompanyId]);

  return (
    <div className="home-page">
      <header className="hero-section" style={{ alignItems: 'flex-start', paddingTop: 48, paddingBottom: 48 }}>
        <div className="hero-content" style={{ width: 'min(100%, 1180px)', alignItems: 'stretch' }}>
          <div style={{ width: '100%', textAlign: 'left' }}>
            <h1 className="page-title">Panel de Admin</h1>
          </div>

          {error && <div className="error-message" style={{ width: '100%' }}>{error}</div>}

          {loading ? (
            <div className="login-form profile-wide" style={{ maxWidth: '100%' }}>
              <p>Cargando panel...</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, width: '100%' }}>
                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="label">Empresas</div>
                  <div className="value" style={{ fontSize: 28 }}>{overview?.totals.companies ?? 0}</div>
                </div>
                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="label">Empleos</div>
                  <div className="value" style={{ fontSize: 28 }}>{overview?.totals.jobs ?? 0}</div>
                </div>
                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="label">Activos</div>
                  <div className="value" style={{ fontSize: 28 }}>{overview?.totals.activeJobs ?? 0}</div>
                </div>
                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="label">Sin empresa</div>
                  <div className="value" style={{ fontSize: 28 }}>{overview?.totals.jobsWithoutCompany ?? 0}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 20, width: '100%', alignItems: 'start' }}>
                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="section-title" style={{ marginTop: 0 }}>Empresas</div>
                  <input
                    className="form-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre, RIF o industria"
                    style={{ marginBottom: 16 }}
                  />

                  <div style={{ display: 'grid', gap: 12, maxHeight: 700, overflowY: 'auto' }}>
                    {filteredCompanies.map((company) => {
                      const selected = company.company_id === selectedCompanyId;
                      return (
                        <button
                          key={company.company_id}
                          type="button"
                          onClick={() => setSelectedCompanyId(company.company_id)}
                          style={{
                            textAlign: 'left',
                            border: selected ? '1px solid #0b3b2a' : '1px solid #e5e7eb',
                            background: selected ? '#f0fdf4' : '#fff',
                            borderRadius: 12,
                            padding: 14,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{company.company_name}</div>
                          <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{company.company_rif}</div>
                          <div style={{ color: '#334155', fontSize: 14, marginTop: 8 }}>
                            {company.industry} · {company.company_size}
                          </div>
                          <div style={{ color: '#334155', fontSize: 14, marginTop: 8 }}>
                            {company.job_count} empleos · {company.active_job_count} activos
                          </div>
                          <div style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                            Registrada: {formatDate(company.created_at)}
                          </div>
                        </button>
                      );
                    })}

                    {filteredCompanies.length === 0 && (
                      <div className="empty-state">No hay empresas que coincidan con la búsqueda.</div>
                    )}
                  </div>
                </div>

                <div className="login-form" style={{ maxWidth: '100%' }}>
                  <div className="section-title" style={{ marginTop: 0 }}>Detalle de Empresa</div>

                  {companyJobsLoading && <p>Cargando empleos de la empresa...</p>}

                  {!companyJobsLoading && !companyJobs && (
                    <div className="empty-state">Selecciona una empresa para ver sus empleos.</div>
                  )}

                  {!companyJobsLoading && companyJobs && (
                    <>
                      <div className="profile-details" style={{ marginBottom: 20 }}>
                        <div className="row"><span className="label">Nombre</span><span className="value">{companyJobs.company.company_name}</span></div>
                        <div className="row"><span className="label">RIF</span><span className="value">{companyJobs.company.company_rif}</span></div>
                        {companyJobs.company.verification_status && companyJobs.company.verification_status.toLowerCase() !== 'pending' && (
                          <div className="row"><span className="label">Estado</span><span className="value">{companyJobs.company.verification_status}</span></div>
                        )}
                        {companyJobs.company.company_email && (
                          <div className="row"><span className="label">Correo</span><span className="value">{companyJobs.company.company_email}</span></div>
                        )}
                        {companyJobs.company.company_phone && (
                          <div className="row"><span className="label">Teléfono</span><span className="value">{companyJobs.company.company_phone}</span></div>
                        )}
                        {companyJobs.company.company_website && (
                          <div className="row">
                            <span className="label">Sitio web</span>
                            <span className="value">
                              <a href={companyJobs.company.company_website} target="_blank" rel="noreferrer">
                                {companyJobs.company.company_website}
                              </a>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="section-title">Empleos Registrados</div>

                      {companyJobs.jobs.length === 0 ? (
                        <div className="empty-state">Esta empresa todavía no ha publicado empleos.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 14 }}>
                          {companyJobs.jobs.map((job) => (
                            <div key={job.job_id} className="card" style={{ padding: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                                <div style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                                  <div className="card-title">{job.title}</div>
                                  <div className="card-text">
                                    {formatWorkMode(job.work_mode)} · {formatRateType(job.rate_type)} · {job.currency}
                                  </div>
                                </div>
                                <span className={`badge ${job.is_active ? 'badge-accepted' : 'badge-withdrawn'}`}>
                                  {job.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>

                              <div style={{ marginTop: 10, color: '#334155', textAlign: 'left' }}>
                                {job.description}
                              </div>

                              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ fontSize: 14, color: '#64748b' }}>
                                  Publicado: {formatDate(job.created_at)}
                                </div>
                                <Link to={`/jobs/${job.job_id}`} className="btn btn-secondary">
                                  Ver empleo
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </div>
  );
};

export default AdminDashboardPage;
