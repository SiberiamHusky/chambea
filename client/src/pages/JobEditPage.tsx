import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import jobService from '../services/jobService';
import jobsService from '../services/jobsService';
import type { JobDetail } from '../services/jobsService';
import type { JobPosting } from '../types';

// Estados y ciudades de Venezuela (lista básica)
const VENEZUELA_STATES = [
  'Distrito Capital',
  'Miranda',
  'Carabobo',
  'Zulia',
  'Aragua',
  'Lara',
  'Anzoátegui',
  'Bolívar',
  'Monagas',
  'Mérida',
  'Táchira',
  'Nueva Esparta',
  'Falcón',
  'Portuguesa',
  'Barinas',
  'Trujillo',
  'Sucre',
  'Yaracuy',
  'Cojedes',
  'Apure',
  'Amazonas',
  'Delta Amacuro',
  'Guárico',
  'La Guaira',
];

const CITIES_BY_STATE: Record<string, string[]> = {
  'Distrito Capital': ['Caracas'],
  Miranda: ['Los Teques', 'Guarenas', 'Guatire', 'Santa Teresa del Tuy', 'Ocumare del Tuy'],
  Carabobo: ['Valencia', 'Puerto Cabello', 'Guacara', 'San Diego'],
  Zulia: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda'],
  Aragua: ['Maracay', 'La Victoria', 'Turmero'],
  Lara: ['Barquisimeto', 'Carora'],
  Anzoátegui: ['Barcelona', 'Puerto La Cruz', 'Lechería'],
  Bolívar: ['Ciudad Guayana', 'Ciudad Bolívar'],
  Monagas: ['Maturín'],
  Mérida: ['Mérida', 'El Vigía'],
  Táchira: ['San Cristóbal'],
  'Nueva Esparta': ['Porlamar', 'La Asunción', 'Pampatar'],
  Falcón: ['Coro', 'Punto Fijo'],
  Portuguesa: ['Guanare', 'Acarigua'],
  Barinas: ['Barinas'],
  Trujillo: ['Trujillo', 'Valera'],
  Sucre: ['Cumaná', 'Carúpano'],
  Yaracuy: ['San Felipe'],
  Cojedes: ['San Carlos'],
  Apure: ['San Fernando de Apure'],
  Amazonas: ['Puerto Ayacucho'],
  'Delta Amacuro': ['Tucupita'],
  Guárico: ['San Juan de los Morros', 'Calabozo'],
  'La Guaira': ['La Guaira'],
};

const JobEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const initialJob = (location.state as any)?.job as JobDetail | undefined;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('onsite');
  const [rateType, setRateType] = useState<'hourly' | 'fixed'>('hourly');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [isActive, setIsActive] = useState(true);

  const [addrState, setAddrState] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrPostal, setAddrPostal] = useState('');

  const cityOptions = useMemo(() => {
    return addrState ? CITIES_BY_STATE[addrState] || [] : [];
  }, [addrState]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Título es requerido');
    if (!description.trim()) errors.push('Descripción es requerida');
    if (!['remote', 'hybrid', 'onsite'].includes(workMode)) errors.push('Modalidad inválida');
    if (!['hourly', 'fixed'].includes(rateType)) errors.push('Tipo de tarifa inválido');
    if (!['USD', 'EUR', 'VES'].includes(currency)) errors.push('Moneda inválida');
    const hasStructuredAddress = !!(addrState && addrCity && addrLine);
    if (workMode !== 'remote' && !hasStructuredAddress) {
      if (!addrState) errors.push('Estado es requerido');
      if (!addrCity) errors.push('Ciudad es requerida');
      if (!addrLine) errors.push('Dirección específica es requerida');
    }
    if (salaryMin !== '' || salaryMax !== '') {
      const min = Number(salaryMin);
      const max = Number(salaryMax);
      if (Number.isNaN(min) || Number.isNaN(max)) errors.push('El rango salarial debe ser numérico');
      if (min < 0 || max < 0) errors.push('El rango salarial no puede ser negativo');
      if (max && min && min > max) errors.push('El mínimo no puede ser mayor que el máximo');
    }
    return errors;
  }, [title, description, workMode, rateType, currency, addrState, addrCity, addrLine, salaryMin, salaryMax]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Si venimos desde la página de detalle con el empleo precargado, úsalo primero
        if (initialJob) {
          setTitle(initialJob.title || '');
          setDescription(initialJob.description || '');
          setWorkMode((initialJob.work_mode as any) || 'onsite');
          setRateType((initialJob.rate_type as any) || 'hourly');
          setCurrency((initialJob.currency as any) || 'USD');
          setSalaryMin(initialJob.budget_min != null ? String(initialJob.budget_min) : '');
          setSalaryMax(initialJob.budget_max != null ? String(initialJob.budget_max) : '');
          setIsActive(typeof initialJob.is_active === 'boolean' ? initialJob.is_active : true);
          // Intentar obtener la dirección cruda para prefilling si aplica
          try {
            const raw = await jobService.getJobById(id);
            const ja: any = (raw as any).job_address || (raw as any).company?.company_address || null;
            if (ja) {
              setAddrState(ja.state || '');
              setAddrCity(ja.city || '');
              setAddrLine(ja.address_line || '');
              setAddrPostal(ja.postal_code || '');
            }
            // Si por cualquier motivo el estado inicial no trajo presupuesto, tomarlo del objeto crudo.
            if ((raw as any).budget_min != null && (salaryMin === '' || salaryMin == null)) {
              setSalaryMin(String((raw as any).budget_min));
            }
            if ((raw as any).budget_max != null && (salaryMax === '' || salaryMax == null)) {
              setSalaryMax(String((raw as any).budget_max));
            }
          } catch {}
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        // Primero: usar servicio normalizado (mismo que el detalle)
        let normalized = await jobsService.getJobById(id);
        // Fallback 1: objeto crudo
        if (!normalized) {
          try {
            const raw = await jobService.getJobById(id);
            normalized = raw as any;
          } catch {}
        }
        // Fallback 2: búsqueda autenticada y filtrar por ID
        if (!normalized) {
          try {
            const res = await jobService.searchJobsAuthenticated({ limit: 100 });
            const candidates = (res?.data ?? []) as any[];
            const hit = candidates.find((p) => (p.job_id ?? p.id) === id);
            normalized = hit ? jobsService.toJobDetail(hit) as any : null;
          } catch {}
        }

        if (!mounted) return;
        if (!normalized) {
          setError(`Empleo no encontrado (ID: ${id})`);
          setLoading(false);
          return;
        }

        // Prefill base desde normalizado (coincide con el detalle)
        setTitle((normalized as any).title || '');
        setDescription((normalized as any).description || '');
        setWorkMode(((normalized as any).work_mode as any) || 'onsite');
        setRateType(((normalized as any).rate_type as any) || 'hourly');
        setCurrency(((normalized as any).currency as any) || 'USD');
        const min = (normalized as any).budget_min != null ? String((normalized as any).budget_min) : '';
        const max = (normalized as any).budget_max != null ? String((normalized as any).budget_max) : '';
        setSalaryMin(min);
        setSalaryMax(max);
        setIsActive(typeof (normalized as any).is_active === 'boolean' ? (normalized as any).is_active : true);

        // Segundo: intentar obtener la dirección desde el objeto crudo (si no vino en normalizado)
        try {
          const raw = await jobService.getJobById(id);
          const ja: any = (raw as any).job_address || (raw as any).company?.company_address || null;
          if (ja) {
            setAddrState(ja.state || '');
            setAddrCity(ja.city || '');
            setAddrLine(ja.address_line || '');
            setAddrPostal(ja.postal_code || '');
          }
        } catch {}
        setLoading(false);
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Error cargando el empleo';
        setError(Array.isArray(msg) ? msg[0] : msg);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, initialJob]);

  // Reset ciudad cuando cambia estado
  useEffect(() => { setAddrCity(''); }, [addrState]);

  const canSubmit = () => {
    if (!title.trim() || !description.trim()) return false;
    if (!['remote', 'hybrid', 'onsite'].includes(workMode)) return false;
    if (!['hourly', 'fixed'].includes(rateType)) return false;
    if (!['USD', 'EUR', 'VES'].includes(currency)) return false;
    const hasStructuredAddress = !!(addrState && addrCity && addrLine);
    if (workMode !== 'remote' && !hasStructuredAddress) return false;
    if (salaryMin !== '' || salaryMax !== '') {
      const min = Number(salaryMin);
      const max = Number(salaryMax);
      if (Number.isNaN(min) || Number.isNaN(max)) return false;
      if (min < 0 || max < 0) return false;
      if (max && min && min > max) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!canSubmit()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Partial<JobPosting> = {
        title,
        description,
        work_mode: workMode,
        rate_type: rateType,
        currency,
        budget_min: salaryMin !== '' ? Number(salaryMin) : undefined,
        budget_max: salaryMax !== '' ? Number(salaryMax) : undefined,
        is_active: isActive,
      } as any;
      if (workMode !== 'remote') {
        (payload as any).job_address = {
          country: 'Venezuela',
          state: addrState,
          city: addrCity,
          address_line: addrLine,
          postal_code: addrPostal || undefined,
        };
      } else {
        // Si es remoto, no enviamos dirección
        (payload as any).job_address = undefined;
      }
      await jobService.updateJob(id, payload);
      setSuccess('Empleo actualizado correctamente');
      // Volver al detalle del empleo
      setTimeout(() => navigate(`/jobs/${id}`), 400);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Error al actualizar el empleo';
      const text = Array.isArray(msg) ? msg[0] : msg;
      setError(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <main className="section">
            <div className="login-form" style={{ maxWidth: 880 }}>
              <h1 style={{ marginTop: 0 }}>Editar empleo</h1>
              {loading && <div className="loading-screen">Cargando empleo…</div>}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="status ok">{success}</div>}

              {!loading && !error && (
                <>
                  {/* Información básica */}
                  <div className="form-row">
                    <label className="form-label" htmlFor="title">Título</label>
                    <input id="title" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label className="form-label" htmlFor="description">Descripción</label>
                    <textarea id="description" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ resize: 'vertical' }} />
                  </div>

                  {/* Configuración económica y modalidad antes de ubicación */}
                  <div className="grid-2">
                    <div className="form-row">
                      <label className="form-label" htmlFor="workmode">Modalidad</label>
                      <select id="workmode" className="form-input" value={workMode} onChange={(e) => setWorkMode(e.target.value as any)}>
                        <option value="remote">Remoto</option>
                        <option value="hybrid">Híbrido</option>
                        <option value="onsite">Presencial</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label className="form-label" htmlFor="ratetype">Tipo de tarifa</label>
                      <select id="ratetype" className="form-input" value={rateType} onChange={(e) => setRateType(e.target.value as any)}>
                        <option value="hourly">Por hora</option>
                        <option value="fixed">Fijo</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-row">
                      <label className="form-label" htmlFor="currency">Moneda</label>
                      <select id="currency" className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value as any)}>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="VES">VES</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label className="form-label">Rango salarial</label>
                      <div className="grid-2">
                        <input type="number" min={0} step="any" className="form-input" placeholder="Mín" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
                        <input type="number" min={0} step="any" className="form-input" placeholder="Máx" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Estado activo */}
                  <div className="form-row">
                    <label className="form-label" htmlFor="active">Activa</label>
                    <input id="active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  </div>

                  {/* Ubicación: ocultar si remoto */}
                  {workMode !== 'remote' && (
                    <div className="card" style={{ marginTop: 16 }}>
                      <div className="card-body">
                        <h3 style={{ marginTop: 0 }}>Ubicación</h3>
                        <div className="grid-2">
                          <div className="form-row">
                            <label className="form-label" htmlFor="state">Estado</label>
                            <select id="state" className="form-input" value={addrState} onChange={(e) => setAddrState(e.target.value)}>
                              <option value="">Selecciona un estado</option>
                              {VENEZUELA_STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-row">
                            <label className="form-label" htmlFor="city">Ciudad</label>
                            <select id="city" className="form-input" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} disabled={!addrState}>
                              <option value="">Selecciona una ciudad</option>
                              {cityOptions.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid-2">
                          <div className="form-row">
                            <label className="form-label" htmlFor="postal">Código postal</label>
                            <input id="postal" className="form-input" value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} />
                          </div>
                          <div className="form-row">
                            <label className="form-label" htmlFor="addrline">Dirección específica</label>
                            <input id="addrline" className="form-input" value={addrLine} onChange={(e) => setAddrLine(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="status warn" style={{ marginTop: 12 }}>
                      Completa los campos requeridos:
                      <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                        {validationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-primary" disabled={submitting || !canSubmit()} onClick={handleSubmit}>
                      {submitting ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                    <button className="btn" style={{ marginLeft: 8 }} onClick={() => navigate(`/jobs/${id}`)}>Cancelar</button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </header>
    </div>
  );
};

export default JobEditPage;