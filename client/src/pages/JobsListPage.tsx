import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jobsService from '../services/jobsService';
import type { JobSummary } from '../services/jobsService';

const JobsListPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      const data = await jobsService.listJobs();
      setJobs(data);
      setLoading(false);
    };
    fetchJobs().catch((e) => {
      console.error(e);
      setError('No se pudieron cargar los empleos.');
      setLoading(false);
    });
  }, []);

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Empleos disponibles</h1>
          <p>Explora oportunidades y postula a la que te interese.</p>
          <main className="section">
            <div className="login-form" style={{ maxWidth: 880 }}>
              {loading && <div className="loading-screen">Cargando empleos…</div>}
              {error && <div className="error-message">{error}</div>}
              {!loading && !error && jobs.length === 0 && (
                <div className="status warn" role="status">Aún no hay empleos disponibles. Vuelve más tarde.</div>
              )}
              <div className="grid">
                {jobs.map((job) => (
                  <article key={job.id} className="card">
                    <div className="card-body">
                      <div className="card-title">{job.title}</div>
                      {job.company_name && <div className="card-subtitle">{job.company_name}</div>}
                      {job.work_mode && (
                        <div className="card-meta">
                          <span className={`badge-workmode ${job.work_mode}`}>
                            {job.work_mode === 'remote' ? 'Remoto' : job.work_mode === 'hybrid' ? 'Híbrido' : 'Presencial'}
                          </span>
                        </div>
                      )}
                      {job.location && <p className="card-text" style={{ color: '#64748b' }}>{job.location}</p>}
                      {job.salary_range && <p className="card-text" style={{ color: '#0b3b2a', fontWeight: 600 }}>{job.salary_range}</p>}
                      <div className="card-actions">
                        <Link to={`/jobs/${job.id}`} className="btn btn-primary">Ver detalle</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </main>
        </div>
      </header>
    </div>
  );
};

export default JobsListPage;