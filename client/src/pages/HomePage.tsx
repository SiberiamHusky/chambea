import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import jobService from '../services/jobService';
import jobsService from '../services/jobsService';
import type { JobPosting, SearchResponse } from '../types';
import type { JobSummary } from '../services/jobsService';
import { Link, useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[] | JobSummary[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setJobsLoading(true);
    setJobsError(null);
    
    if (isAuthenticated) {
      jobService
        .searchJobsAuthenticated({ limit: 12 })
        .then((res: SearchResponse) => {
          if (!active) return;
          const list = res?.data ?? [];
          setJobs(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          if (!active) return;
          const message = err?.response?.data?.message || 'No se pudieron cargar los empleos.';
          setJobsError(message);
        })
        .finally(() => {
          if (!active) return;
          setJobsLoading(false);
        });
    } else {
      jobsService
        .listJobs()
        .then((data) => {
          if (!active) return;
          setJobs(data);
        })
        .catch((err) => {
          if (!active) return;
          console.error(err);
          setJobsError('No se pudieron cargar los empleos.');
        })
        .finally(() => {
          if (!active) return;
          setJobsLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const getJobId = (job: JobPosting | JobSummary): string | number => {
    if ('job_id' in job) return job.job_id;
    if ('id' in job) return job.id;
    return '';
  };

  const getJobTitle = (job: JobPosting | JobSummary): string => {
    if ('title' in job) return job.title;
    return '';
  };

  const getCompanyName = (job: JobPosting | JobSummary): string => {
    if ('company_name' in job) return job.company_name || '';
    if ('company' in job) return job.company?.company_name || job.employer?.company?.company_name || 'Empresa no especificada';
    return 'Empresa no especificada';
  };

  const getWorkMode = (job: JobPosting | JobSummary): string => {
    if ('work_mode' in job) return job.work_mode || 'unknown';
    return 'unknown';
  };

  return (
    <div className="home-page">
      <main className="section">
        <h1 className="text-3xl font-bold text-center mb-8 pt-8">Ofertas de Trabajo Disponibles</h1>
        
        {isAuthenticated && (
          <form className="search-bar mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, empresa o ubicación"
              aria-label="Buscar empleos"
              className="search-input"
            />
            {query && (
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                aria-label="Limpiar"
                title="Limpiar"
                onClick={() => setQuery('')}
              >
                ✖
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-icon"
              aria-label="Buscar"
              title="Buscar"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        )}

        {jobsLoading && (
          <div className="loading text-center py-8">Cargando empleos…</div>
        )}

        {!jobsLoading && jobsError && (
          <div className="error-message text-center py-4" role="alert">{jobsError}</div>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <div className="empty-state text-center py-8" role="status">Aún no hay empleos disponibles. Vuelve más tarde.</div>
        )}

        {!jobsLoading && !jobsError && jobs.length > 0 && (
          <div className="grid">
            {(jobs.filter((job) => {
              const q = query.toLowerCase().trim();
              if (!q) return true;
              return (
                getJobTitle(job).toLowerCase().includes(q) ||
                getCompanyName(job).toLowerCase().includes(q)
              );
            })).map((job) => (
              <article key={getJobId(job)} className="card">
                <div className="card-body">
                  <h3 className="card-title">
                    <Link to={`/jobs/${getJobId(job)}`} className="link-brand">{getJobTitle(job)}</Link>
                  </h3>
                  <p className="card-subtitle">{getCompanyName(job)}</p>
                  <div className="card-meta">
                    <span className={`badge-workmode ${getWorkMode(job)}`}>
                      {getWorkMode(job) ? (getWorkMode(job) === 'remote' ? 'Remoto' : getWorkMode(job) === 'hybrid' ? 'Híbrido' : 'Presencial') : 'No especificado'}
                    </span>
                  </div>
                  {('budget_min' in job || 'budget_max' in job) && ('currency' in job) && job.currency && (
                    <p className="card-text">
                      {`${job.currency} ${job.budget_min ?? ''}${job.budget_max ? ` - ${job.budget_max}` : ''}`}
                    </p>
                  )}
                  <div className="card-actions">
                    <Link to={`/jobs/${getJobId(job)}`} className="btn btn-primary">Ver detalle</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante de mensajes para ambos roles */}
      {isAuthenticated && user?.role && (
        <Link
          to="/chat"
          className="fab-message"
          aria-label="Mensajes"
          title="Mensajes"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h3v3l4-3h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4z" fill="currentColor" />
          </svg>
        </Link>
      )}
      
      {isAuthenticated && user?.role === 'employer' && (
        <button
          className="fab-plus"
          aria-label="Crear nuevo"
          title="Crear nuevo"
          onClick={() => navigate('/jobs/new', { state: { fromCreateButton: true } })}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage;
