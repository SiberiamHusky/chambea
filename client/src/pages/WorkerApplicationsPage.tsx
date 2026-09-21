import { useEffect, useState } from 'react';
import applicationsService, { type ApplicationItem } from '../services/applicationsService';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

function statusLabel(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'pending' || s.includes('applied')) return 'Aplicado';
  if (s.includes('shortlist')) return 'Preseleccionado';
  if (s.includes('interview')) return 'Entrevista';
  if (s === 'accepted' || s.includes('hired')) return 'Contratado';
  if (s === 'rejected') return 'Rechazado';
  if (s === 'withdrawn') return 'Retirado';
  return status || 'Sin estado';
}

function statusColor(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'pending' || s.includes('applied')) return '#3b82f6';
  if (s.includes('shortlist')) return '#f59e0b';
  if (s.includes('interview')) return '#8b5cf6';
  if (s === 'accepted' || s.includes('hired')) return '#10b981';
  if (s === 'rejected') return '#ef4444';
  if (s === 'withdrawn') return '#6b7280';
  return '#9ca3af';
}

export default function WorkerApplicationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await applicationsService.listMyApplications();
      if (!active) return;
      setItems(data);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleWithdraw(id: string) {
    const ok = window.confirm('¿Seguro que quieres retirar esta postulación?');
    if (!ok) return;
    try {
      setError(null);
      setWithdrawingId(id);
      await applicationsService.withdrawApplication(id);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'WITHDRAWN' } : it)));
      setSuccess('Postulación retirada correctamente.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError('No se pudo retirar la postulación. Inténtalo más tarde.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setWithdrawingId(null);
    }
  }

  if (!user) {
    return (
      <div className="page-container">
        <h1>Mis postulaciones</h1>
        <p>Debes iniciar sesión para ver tus postulaciones.</p>
      </div>
    );
  }

  if (user.role !== 'worker') {
    return (
      <div className="page-container">
        <h1>Mis postulaciones</h1>
        <p>Esta sección es exclusiva para trabajadores.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Mis postulaciones</h1>
      {success && <div className="success-message">{success}</div>}
      {loading && <p>Cargando tus postulaciones...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>Aún no tienes postulaciones.</p>
          <p>
            Explora empleos en el <Link to="/">Inicio</Link> y postúlate.
          </p>
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {items.map((app) => (
            <div key={app.id} className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{app.job.title}</h3>
                  {app.job.company_name && (
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>{app.job.company_name}</p>
                  )}
                </div>
                <span className="badge" style={{ background: statusColor(String(app.status)), color: '#fff', padding: '6px 10px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                  {statusLabel(String(app.status))}
                </span>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                {app.applied_at && (
                  <p className="muted">Postulada el {new Date(app.applied_at).toLocaleDateString('es-ES')}</p>
                )}
              </div>
              <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <Link to={`/jobs/${app.job.id}`} className="btn btn-secondary" style={{ padding: '10px 14px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af', background: '#e5e7eb', color: '#111827', height: 44, display: 'inline-flex', alignItems: 'center' }}>Ver empleo</Link>
                <div>
                  {String(app.status).toLowerCase().includes('applied') || String(app.status).toLowerCase() === 'pending' ? (
                    <button
                      className="btn btn-danger"
                      disabled={withdrawingId === app.id}
                      onClick={() => handleWithdraw(app.id)}
                      style={{ marginLeft: 8, padding: '0 16px', height: 44, borderRadius: 8, fontWeight: 600 }}
                    >
                      {withdrawingId === app.id ? 'Retirando...' : 'Retirar postulación'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}