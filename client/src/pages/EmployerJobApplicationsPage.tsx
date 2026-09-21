import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import applicationsService, { type EmployerApplicationItem, type ApplicationStatus, type EmployerActionStatus } from '../services/applicationsService';
import { useAuth } from '../hooks/useAuth';

function statusLabel(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'pending' || s.includes('applied')) return 'Aplicado';
  if (s === 'accepted' || s.includes('hired')) return 'Contratado';
  if (s === 'rejected') return 'Rechazado';
  if (s === 'withdrawn') return 'Retirado';
  if (s.includes('shortlist')) return 'Preseleccionado';
  if (s.includes('interview')) return 'Entrevista';
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

export default function EmployerJobApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<EmployerApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      const data = await applicationsService.listApplicationsByJob(id);
      if (!active) return;
      setItems(data);
      setLoading(false);
      if (data.length === 0) {
        // No error; simplemente estado vacío
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(app => {
      const status = String(app.status).toLowerCase();
      const matchesQuery = q
        ? (app.worker?.name || '').toLowerCase().includes(q) || (app.worker?.email || '').toLowerCase().includes(q)
        : true;
      const matchesStatus = statusFilter === 'all'
        ? true
        : statusFilter === 'applied'
          ? status === 'pending' || status.includes('applied')
          : statusFilter === 'shortlisted'
            ? status.includes('shortlist')
            : statusFilter === 'interview'
              ? status.includes('interview')
              : statusFilter === 'hired'
                ? status.includes('hired') || status === 'accepted'
                : statusFilter === 'rejected'
                  ? status === 'rejected'
                  : statusFilter === 'withdrawn'
                    ? status === 'withdrawn'
                    : true;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, statusFilter]);

  async function handleStatus(applicationId: string, status: EmployerActionStatus) {
    try {
      setError(null);
      // Confirmar antes de eliminar al rechazar
      if (status === 'rejected') {
        const ok = window.confirm('¿Seguro que deseas rechazar y eliminar esta postulación? Esta acción no se puede deshacer.');
        if (!ok) return;
      }
      setUpdatingId(applicationId);
      if (status === 'rejected') {
        // Para "rechazar", eliminamos la postulación en el backend
        await applicationsService.deleteApplication(applicationId);
        // y la quitamos de la lista local
        setItems(prev => prev.filter(it => it.id !== applicationId));
      } else {
        await applicationsService.updateApplicationStatus(applicationId, status);
        setItems(prev => prev.map(it => (it.id === applicationId ? { ...it, status: status as any } : it)));
      }
    } catch (e) {
      setError('No se pudo actualizar el estado. Intenta más tarde.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleInterview(app: EmployerApplicationItem) {
    if (!app?.id) return;
    const receiverUserId = app.worker?.user_id;
    try {
      setUpdatingId(app.id);
      await applicationsService.updateApplicationStatus(app.id, 'interview');
      setItems(prev => prev.map(it => (it.id === app.id ? { ...it, status: 'interview' as any } : it)));
      // Navegar a la página de entrevistas si tenemos el user_id del worker
      if (receiverUserId) {
        navigate(`/interviews/${receiverUserId}`);
      } else {
        // Si no hay user_id, lleva al listado de chats y muestra aviso
        navigate('/chat');
        setError('No se pudo determinar el usuario del postulante para el chat.');
        setTimeout(() => setError(null), 4000);
      }
    } catch (e) {
      setError('No se pudo actualizar a entrevista. Intenta más tarde.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  }

  if (!user) {
    return (
      <div className="page-container">
        <h1>Postulaciones del empleo</h1>
        <p>Debes iniciar sesión para ver las postulaciones.</p>
      </div>
    );
  }

  if (user.role !== 'employer') {
    return (
      <div className="page-container">
        <h1>Postulaciones del empleo</h1>
        <p>Esta sección es exclusiva para empleadores.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Postulaciones del empleo</h1>
          <p className="muted" style={{ margin: 0 }}>{filteredItems.length} de {items.length} mostradas</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email"
            className="form-input"
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: 240 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
          >
            <option value="all">Todos</option>
            <option value="applied">Aplicados</option>
            <option value="shortlisted">Preseleccionados</option>
            <option value="interview">Entrevista</option>
            <option value="hired">Contratados</option>
            <option value="rejected">Rechazados</option>
            <option value="withdrawn">Retirados</option>
          </select>
        </div>
      </div>
      {loading && <p>Cargando postulaciones…</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="empty-state">
          <p>Aún no hay postulaciones para este empleo.</p>
          <p>
            Puedes volver a la <Link to={`/jobs/${id}`}>detalle del empleo</Link>.
          </p>
        </div>
      )}
      {!loading && items.length > 0 && (
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {filteredItems.map((app) => (
            <div key={app.id} className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {([app.worker?.first_name, app.worker?.last_name].filter(Boolean).join(' ') || app.worker?.name || ' ')
                      .split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="card-title" style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                      {[app.worker?.first_name, app.worker?.last_name].filter(Boolean).join(' ') || app.worker?.name || 'Postulante'}
                    </h3>
                    {app.worker?.email && (
                      <p className="muted" style={{ margin: 0, fontSize: 13 }}>{app.worker.email}</p>
                    )}
                  </div>
                </div>
                <span className="badge" style={{ background: statusColor(String(app.status)), color: '#fff', padding: '6px 10px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                  {statusLabel(String(app.status))}
                </span>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 10 }}>
                {app.applied_at && (
                  <p className="muted">Postulada el {new Date(app.applied_at).toLocaleDateString('es-ES')}</p>
                )}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Carta de presentación</div>
                  <div style={{ whiteSpace: 'pre-line', color: '#374151' }}>{app.cover_letter || '—'}</div>
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <Link to={`/jobs/${id}`} className="btn btn-secondary" style={{ padding: '10px 14px', borderRadius: 8, fontWeight: 600, border: '1px solid #9ca3af', background: '#e5e7eb', color: '#111827' }}>Ver empleo</Link>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <ActionButton
                    label="Preseleccionar"
                    status="shortlisted"
                    disabled={updatingId === app.id}
                    onClick={() => handleStatus(app.id, 'shortlisted')}
                  />
                  <ActionButton
                    label="Entrevista"
                    status="interview"
                    disabled={updatingId === app.id}
                    onClick={() => handleInterview(app)}
                  />
                  <ActionButton
                    label="Contratar"
                    status="hired"
                    disabled={updatingId === app.id}
                    onClick={() => handleStatus(app.id, 'hired')}
                  />
                  <ActionButton
                    label="Rechazar"
                    status="rejected"
                    variant="danger"
                    disabled={updatingId === app.id}
                    onClick={() => handleStatus(app.id, 'rejected')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ label, status, onClick, disabled, variant = 'secondary' }: {
  label: string;
  status: EmployerActionStatus;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'secondary' | 'danger' | 'outline' | 'primary';
}) {
  const cls = variant === 'danger' ? 'btn btn-danger' : variant === 'outline' ? 'btn btn-outline' : variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary';
  const baseStyle: React.CSSProperties = {
    padding: '0 16px',
    height: 44,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: '1px solid transparent',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
  };
  const variantStyle: Record<string, React.CSSProperties> = {
    secondary: { background: '#e5e7eb', color: '#111827', border: '1px solid #9ca3af' },
    primary: { background: '#1d4ed8', color: '#fff' },
    danger: { background: '#b91c1c', color: '#fff' },
    outline: { background: 'transparent', color: '#1f2937', border: '1px solid #6b7280' },
  };
  const style = { ...baseStyle, ...(variantStyle[variant] || {}) } as React.CSSProperties;
  if (disabled) {
    style.opacity = 0.6;
    style.cursor = 'not-allowed';
  }
  return (
    <button className={cls} style={style} disabled={disabled} onClick={onClick} aria-label={label} title={label}>
      {label}
    </button>
  );
}