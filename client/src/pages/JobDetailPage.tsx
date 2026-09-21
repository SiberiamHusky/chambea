import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import jobsService from '../services/jobsService';
import type { JobDetail } from '../services/jobsService';
import applicationsService from '../services/applicationsService';
import jobService from '../services/jobService';

const JobDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [coverLetter, setCoverLetter] = useState<string>('');

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      const data = await jobsService.getJobById(id);
      setJob(data);
      setLoading(false);
      if (!data) setError('No se encontró el empleo.');
    };
    fetchJob().catch((e) => {
      console.error(e);
      setError('Error cargando el empleo.');
      setLoading(false);
    });
  }, [id]);


  const canApply = isAuthenticated && user?.role === 'worker';
  const isEmployer = isAuthenticated && user?.role === 'employer';
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isOwner = isEmployer && !!job?.owner_user_id && job.owner_user_id === user?.id;
  const canManage = isOwner;

  const translateMessage = (msg?: string) => {
    if (!msg) return 'Ocurrió un error. Intenta más tarde.';
    const m = msg.toLowerCase();
    if (m.includes('already applied')) return 'Ya postulaste a este empleo.';
    if (m.includes('only workers can apply')) return 'Solo los trabajadores pueden postular a empleos.';
    if (m.includes('job posting not found')) return 'Empleo no encontrado.';
    if (m.includes('worker profile not found')) return 'No se encontró perfil de trabajador para este usuario.';
    if (m.includes('not allowed to delete this job')) return 'No tienes permiso para eliminar este empleo.';
    if (m.includes('only the job owner employer')) return 'Solo el empleador propietario puede realizar esta acción.';
    return msg; // por defecto mostramos el mensaje original
  };

  const handleApply = async () => {
    if (!id) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const letter = coverLetter?.trim() ? coverLetter.trim() : undefined;
      await applicationsService.applyToJob(id, letter);
      setStatus('Postulación enviada correctamente.');
      setHasApplied(true);
    } catch (e) {
      const msg = (e as any)?.response?.data?.message ?? 'No se pudo enviar la postulación.';
      // Si el backend indica que ya se aplicó, marcamos como aplicado
      const text = Array.isArray(msg) ? msg[0] : msg;
      if (typeof text === 'string' && text.toLowerCase().includes('already applied')) {
        setHasApplied(true);
      }
      setStatus(translateMessage(text));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('¿Seguro que deseas borrar este empleo? Esta acción no se puede deshacer.');
    if (!ok) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await jobService.deleteJob(id);
      setStatus('Empleo eliminado correctamente.');
      navigate('/jobs');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'No se pudo eliminar el empleo.';
      const text = Array.isArray(msg) ? msg[0] : msg;
      setStatus(translateMessage(text));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          {loading && <div className="loading-screen">Cargando empleo…</div>}
          {error && <div className="error-message">{error}</div>}
          {job && (
            <main className="section">
              <div className="login-form" style={{ maxWidth: 820 }}>
                {status && <div className={`status ${status.includes('correctamente') ? 'ok' : 'warn'}`}>{status}</div>}
                <h1 style={{ marginTop: 0 }}>{job.title}</h1>

                <div className="card" style={{ marginTop: 12 }}>
                  <div className="card-body" style={{ textAlign: 'justify' }}>

                    {job.company_name && (
                      <p style={{ marginBottom: 12 }}><strong>Empresa:</strong> {job.company_name}</p>
                    )}

                    {job.work_mode && (
                      <p style={{ marginBottom: 12 }}>
                        <strong>Modalidad de trabajo:</strong> {job.work_mode === 'remote' ? 'Remoto' : job.work_mode === 'hybrid' ? 'Híbrido' : 'Presencial'}
                      </p>
                    )}

                    {(
                      <p style={{ marginBottom: 12 }}>
                        <strong>Ubicación:</strong> {job.location || (job.work_mode === 'remote' ? 'Remoto' : '—')}
                      </p>
                    )}

                    {(job.salary_range) && (
                      <p style={{ marginBottom: 12 }}>
                        <strong>Presupuesto:</strong> {job.salary_range}
                      </p>
                    )}

                    {job.industry && (
                      <p style={{ marginBottom: 12 }}><strong>Industria:</strong> {job.industry}</p>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <strong>Habilidades:</strong>
                        <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                          {job.skills.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.requirements && job.requirements.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <strong>Requisitos:</strong>
                        <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(job.created_at || job.updated_at) && (
                      <p style={{ marginBottom: 12 }}>
                        <strong>Fechas:</strong>
                        {job.created_at ? ` Publicado: ${new Date(job.created_at).toLocaleDateString('es-ES')}` : ''}
                        {job.updated_at ? ` • Actualizado: ${new Date(job.updated_at).toLocaleDateString('es-ES')}` : ''}
                      </p>
                    )}

                    {typeof job.is_active === 'boolean' && (
                      <p style={{ marginBottom: 12 }}><strong>Estado:</strong> {job.is_active ? 'Activa' : 'Inactiva'}</p>
                    )}

                    {job.description && (
                      <div style={{ marginBottom: 0 }}>
                        <strong>Descripción:</strong>
                        <p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{job.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                  {canApply && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                      <label htmlFor="cover-letter" style={{ fontWeight: 600 }}>Carta de presentación</label>
                      <textarea
                        id="cover-letter"
                        className="form-input"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Cuéntale al empleador por qué eres buen candidato…"
                        rows={4}
                        style={{ width: '100%', resize: 'none' }}
                        maxLength={1000}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <small className="form-hint">Máximo 1000 caracteres.</small>
                        <small className="form-hint">{coverLetter.length}/1000</small>
                      </div>
                      <div>
                        <button className="btn btn-primary" onClick={handleApply} disabled={submitting || hasApplied}>
                          {submitting ? 'Enviando postulación…' : hasApplied ? 'Ya postulaste' : 'Postularme'}
                        </button>
                      </div>
                    </div>
                  )}

                  {canManage && (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/jobs/${id}/edit`, { state: { job } })}
                        aria-label="Editar empleo"
                        title="Editar empleo"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/jobs/${id}/applications`)}
                        aria-label="Ver postulaciones"
                        title="Ver postulaciones"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={submitting}
                        aria-label="Borrar empleo"
                        title="Borrar empleo"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </>
                  )}

                  {!isAuthenticated && !canApply && !canManage && !isAdmin && (
                    <div className="status warn">Inicia sesión para ver acciones disponibles.</div>
                  )}
                </div>
              </div>
            </main>
          )}
        </div>
      </header>
    </div>
  );
};

export default JobDetailPage;
