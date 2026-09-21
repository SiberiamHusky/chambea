import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import jobService from '../services/jobService';
import employerService from '../services/employerService';
import jobsService, { type JobSummary } from '../services/jobsService';

const EmployerJobsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<JobSummary[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const isEmployer = isAuthenticated && user?.role === 'employer';

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      if (!isEmployer) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Obtener perfil del empleador para usar employer_id en filtros
        const employerProfile = await employerService.getMyProfile().catch(() => null as any);
        const myEmployerId = (employerProfile as any)?.employer_id ?? (employerProfile as any)?.employer?.employer_id;

        let normalized: JobSummary[] = [];
        let myJobsError: any = null;

        // Intento principal: endpoint dedicado
        try {
          const mine = await jobService.getMyJobs();
          normalized = Array.isArray(mine) ? mine.map((p: any) => jobsService.toJobSummary(p)) : [];
        } catch (e) {
          myJobsError = e;
        }

        // Si hay resultados del endpoint dedicado, úsalos
        if (active && normalized.length > 0) {
          setItems(normalized);
        } else if (active && user?.id) {
          // Fallback: búsqueda autenticada y filtrado por propietario/employer
          try {
            const res = await jobService.searchJobsAuthenticated({ limit: 100 });
            const detailed = (res?.data ?? []).map((p: any) => jobsService.toJobDetail(p));
            const mineDetailed = detailed.filter((d) => {
              const byOwner = d.owner_user_id && d.owner_user_id === user.id;
              const byEmployer = myEmployerId && d.employer_id && d.employer_id === myEmployerId;
              return byOwner || byEmployer;
            });
            const mineSummaries = mineDetailed.map((d) => jobsService.toJobSummary(d));
            setItems(mineSummaries);
          } catch (fallbackErr) {
            // Solo mostrar error si también falla el fallback
            setError((fallbackErr as any)?.response?.data?.message || 'No se pudieron cargar tus empleos.');
          }
        }
      } catch (err: any) {
        const message = err?.response?.data?.message || 'No se pudieron cargar tus empleos.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      active = false;
    };
  }, [isEmployer, user?.id]);

  const headerTitle = useMemo(() => 'Mis empleos', []);

  // Derivar paginación
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }, [items.length, pageSize]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  // Asegurar que la página actual esté dentro de los límites al cambiar items o pageSize
  useEffect(() => {
    setPage((prev) => {
      const next = Math.min(prev, totalPages);
      return next < 1 ? 1 : next;
    });
  }, [totalPages]);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <h1>{headerTitle}</h1>
        <p>Debes iniciar sesión para ver esta sección.</p>
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="page-container">
        <h1>{headerTitle}</h1>
        <p>Esta sección es exclusiva para empleadores.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ marginBottom: 4 }}>{headerTitle}</h1>
      </div>
      {loading && <p>Cargando tus empleos…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>Aún no tienes empleos publicados.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Controles de paginación */}
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af', background: '#e5e7eb', color: '#111827' }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Anterior
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af', background: '#e5e7eb', color: '#111827' }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente
              </button>
              <div style={{ fontSize: 14, color: '#374151', marginLeft: 10 }}>
                Página {page} de {totalPages}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label htmlFor="pageSize" style={{ fontSize: 14, color: '#374151' }}>Por página:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setPageSize(val);
                  setPage(1);
                }}
                style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #9ca3af' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {currentItems.map((job) => (
            <div key={job.id} className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{job.title}</div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>{job.company_name || '—'}</div>
                </div>
                {job.created_at && (
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Publicado el {new Date(job.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ fontSize: 14, color: '#374151' }}>
                  {job.location ? `Ubicación: ${job.location}` : `Ubicación: ${job.work_mode === 'remote' ? 'Remoto' : '—'}`}
                </div>
                <div style={{ fontSize: 14, color: '#374151', textAlign: 'right' }}>
                  {job.salary_range ? `Rango: ${job.salary_range}` : 'Rango: —'}
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary" style={{ padding: '10px 14px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af', background: '#e5e7eb', color: '#111827' }}>Ver empleo</Link>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to={`/jobs/${job.id}/edit`} className="btn" style={{ padding: '10px 14px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af' }}>Editar</Link>
                  <Link to={`/jobs/${job.id}/applications`} className="btn btn-primary" style={{ padding: '10px 14px', borderRadius: 8, fontWeight: 600 }}>Ver postulaciones</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerJobsPage;