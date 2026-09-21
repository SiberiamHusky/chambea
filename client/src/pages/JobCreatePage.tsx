import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import jobService from '../services/jobService';
import employerService from '../services/employerService';
import companyService from '../services/companyService';
import type { Company } from '../services/employerService';

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
  'La Guaira': ['La Guaira', 'Maiquetía'],
};

const JobCreatePage: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const CATEGORY_OPTIONS = [
    'Tecnología',
    'Ventas',
    'Marketing',
    'Finanzas',
    'Diseño',
    'Operaciones',
    'Atención al cliente',
    'Recursos Humanos',
    'Legal',
    'Educación',
    'Salud',
    'Construcción',
    'Logística',
    'Producción',
    'Administración',
  ];
  const [categories, setCategories] = useState<string[]>([]);
  const [catOpen, setCatOpen] = useState<boolean>(false);
  const [location, setLocation] = useState('');
  // Dirección estructurada para job_address (solo Venezuela)
  const [addrState, setAddrState] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('onsite');
  const [rateType, setRateType] = useState<'hourly' | 'fixed'>('hourly');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'freelance'>('full-time');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Selector de empresa
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Opciones de ciudades basadas en el estado seleccionado
  const cityOptions = useMemo(() => CITIES_BY_STATE[addrState] || [], [addrState]);
  useEffect(() => {
    // Resetear ciudad si no pertenece al estado actual
    if (addrCity && !cityOptions.includes(addrCity)) {
      setAddrCity('');
    }
  }, [addrState]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [profile, list] = await Promise.all([
          employerService.getMyProfile(),
          companyService.listAll(),
        ]);
        if (!mounted) return;
        let companiesList = Array.isArray(list) ? list : [];
        const preselect = profile?.company?.company_id;
        if (preselect) {
          setSelectedCompanyId(preselect);
          const exists = companiesList.some((c) => c.company_id === preselect);
          if (!exists && profile?.company) {
            companiesList = [...companiesList, profile.company];
          }
        }
        setCompanies(companiesList);
      } catch (_err) {
        // Fallback: intentar obtener solo la empresa del employer para poblar el selector
        try {
          const myCompany = await employerService.getMyCompany();
          if (mounted && myCompany) {
            setCompanies([myCompany]);
            setSelectedCompanyId(myCompany.company_id);
          }
        } catch (_) {
          // Ignorar
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = () => {
    if (!title.trim() || !description.trim() || categories.length === 0) return false;
    if (!['remote', 'hybrid', 'onsite'].includes(workMode)) return false;
    if (!['hourly', 'fixed'].includes(rateType)) return false;
    if (!['USD', 'EUR', 'VES'].includes(currency)) return false;
    // Validación de dirección: requerida si no es remoto
    const hasStructuredAddress = !!(addrState && addrCity && addrLine);
    if (workMode !== 'remote' && !hasStructuredAddress) return false;
    // Si hay salarios, validar que sean números y coherentes
    if (salaryMin !== '' || salaryMax !== '') {
      const min = Number(salaryMin);
      const max = Number(salaryMax);
      if (Number.isNaN(min) || Number.isNaN(max)) return false;
      if (min < 0 || max < 0) return false;
      if (max && min && min > max) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    if (!user || user.role !== 'employer') {
      setError('Debes iniciar sesión como empleador para publicar.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
  try {
      // Obtener el employer_id del perfil del empleador autenticado
      const employerProfile = await employerService.getMyProfile();
      const employer_id = employerProfile?.employer_id;
      const company_id = selectedCompanyId || employerProfile?.company?.company_id;
      if (!employer_id) {
        throw new Error('No se encontró tu perfil de empleador. Configúralo en tu perfil.');
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: categories.join(', '),
        work_mode: workMode,
        rate_type: rateType,
        currency,
        is_active: isActive,
        budget_min: salaryMin !== '' ? Number(salaryMin) : undefined,
        budget_max: salaryMax !== '' ? Number(salaryMax) : undefined,
        employer_id,
        company_id,
        job_address: (workMode !== 'remote' && addrState && addrCity && addrLine)
          ? {
              country: 'Venezuela',
              state: addrState.trim(),
              city: addrCity.trim(),
              address_line: addrLine.trim(),
              postal_code: addrPostal.trim() || undefined,
            }
          : undefined,
      };
      const created = await jobService.createJob(payload);
      setSuccess('Empleo publicado correctamente');
      // Navegar al detalle del empleo creado si hay id
      if ((created as any)?.job_id) {
        navigate(`/jobs/${(created as any).job_id}`);
      } else {
        navigate('/jobs');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al publicar el empleo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page job-create">
      <main className="section" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="form-card">
          <h1 className="page-title">Crear empleo</h1>
          <p className="page-subtitle">Publica una nueva oferta de trabajo.</p>
          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="status ok" role="status">{success}</div>}
          <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group col-span-2">
              <label htmlFor="companySelector">Empresa</label>
              <select
                id="companySelector"
                name="companySelector"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="form-input"
              >
                <option value="">Sin empresa</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
              <small className="form-hint">Opcional: vincula la oferta a tu empresa.</small>
            </div>
            <div className="form-group col-span-2">
              <label htmlFor="title">Título<span className="required-badge">*</span></label>
              <input id="title" name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="Ejemplo: Desarrollador Frontend" required />
            </div>

            <div className="form-group col-span-2">
              <label htmlFor="description">Descripción<span className="required-badge">*</span></label>
              <textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows={4} placeholder="Responsabilidades, requisitos y beneficios" required />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="categories">Categorías<span className="required-badge">*</span></label>
              <div
                id="categories"
                className="form-input"
                role="button"
                aria-haspopup="listbox"
                aria-expanded={catOpen}
                onClick={() => setCatOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCatOpen((v) => !v);
                  }
                  if (e.key === 'Escape') setCatOpen(false);
                }}
                tabIndex={0}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>
                  {categories.length === 0 ? 'Selecciona categorías' : categories.join(', ')}
                </span>
                <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {categories.length > 0 && (
                    <button
                      type="button"
                      aria-label="Limpiar categorías"
                      title="Limpiar"
                      onClick={(e) => { e.stopPropagation(); setCategories([]); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 18,
                        lineHeight: 1,
                        color: '#666',
                      }}
                    >
                      ×
                    </button>
                  )}
                  <span>▾</span>
                </span>
              </div>
              {catOpen && (
                <div
                  className="dropdown"
                  role="listbox"
                  aria-multiselectable="true"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    padding: 8,
                    marginTop: 4,
                    zIndex: 20,
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  {CATEGORY_OPTIONS.map((opt) => {
                    const checked = categories.includes(opt);
                    return (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCategories((prev) => [...prev, opt]);
                            } else {
                              setCategories((prev) => prev.filter((c) => c !== opt));
                            }
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <small className="form-hint">Puedes seleccionar varias categorías.</small>
            </div>

            {/* Modalidad, tarifa, moneda y salarios antes de ubicación */}
            <div className="form-group">
              <label htmlFor="workMode">Modalidad de trabajo<span className="required-badge">*</span></label>
              <select id="workMode" name="workMode" value={workMode} onChange={(e) => setWorkMode(e.target.value as any)} className="form-input" required>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
                <option value="onsite">Presencial</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rateType">Tipo de tarifa<span className="required-badge">*</span></label>
              <select id="rateType" name="rateType" value={rateType} onChange={(e) => setRateType(e.target.value as any)} className="form-input" required>
                <option value="hourly">Por hora</option>
                <option value="fixed">Fija</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="currency">Moneda<span className="required-badge">*</span></label>
              <select id="currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="form-input" required>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="VES">VES</option>
              </select>
            </div>

            <div className="form-row col-span-2" style={{ display: 'flex', gap: 8 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="salaryMin">Salario mínimo</label>
                <input id="salaryMin" name="salaryMin" type="number" inputMode="numeric" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className="form-input" placeholder="Ej: 800" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="salaryMax">Salario máximo</label>
                <input id="salaryMax" name="salaryMax" type="number" inputMode="numeric" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className="form-input" placeholder="Ej: 1200" />
              </div>
            </div>

            {workMode !== 'remote' && (
              <>
                <div className="form-group col-span-2">
                  <label>Ubicación</label>
                  <small className="form-hint">Completa la dirección para presencial o híbrido.</small>
                </div>
                <div className="form-row col-span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="form-group">
                    <label htmlFor="addrState">Estado<span className="required-badge">*</span></label>
                    <select id="addrState" name="addrState" value={addrState} onChange={(e) => setAddrState(e.target.value)} className="form-input">
                      <option value="">Selecciona un estado</option>
                      {VENEZUELA_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="addrCity">Ciudad<span className="required-badge">*</span></label>
                    <select id="addrCity" name="addrCity" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="form-input" disabled={!addrState}>
                      <option value="">{addrState ? 'Selecciona una ciudad' : 'Selecciona un estado primero'}</option>
                      {cityOptions.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <small className="form-hint">Las ciudades dependen del estado seleccionado.</small>
                  </div>
                </div>
                <div className="form-row col-span-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  <div className="form-group">
                    <label htmlFor="addrPostal">Código postal</label>
                    <input id="addrPostal" name="addrPostal" type="text" value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} className="form-input" placeholder="Ej: 1060" />
                  </div>
                </div>
                <div className="form-group col-span-2">
                  <label htmlFor="addrLine">Dirección específica<span className="required-badge">*</span></label>
                  <input id="addrLine" name="addrLine" type="text" value={addrLine} onChange={(e) => setAddrLine(e.target.value)} className="form-input" placeholder="Ej: Av. Francisco de Miranda, Torre Parque Cristal" />
                </div>
              </>
            )}


            <div className="form-row col-span-2" style={{ display: 'flex', gap: 8 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="jobType">Tipo de trabajo<span className="required-badge">*</span></label>
                <select id="jobType" name="jobType" value={jobType} onChange={(e) => setJobType(e.target.value as any)} className="form-input" required>
                  <option value="full-time">Tiempo completo</option>
                  <option value="part-time">Medio tiempo</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                <label htmlFor="isActive" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input id="isActive" name="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Activo
                </label>
              </div>
            </div>
          <div className="actions">
            <button type="submit" className="submit-button" disabled={loading || !canSubmit()}>
              {loading ? 'Publicando…' : 'Publicar empleo'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancelar</button>
          </div>
          </div>
          </form>
          <p className="form-hint" style={{ marginTop: 12 }}>
            Completa los campos requeridos. Tras publicar, te redireccionaremos al detalle.
          </p>
        </div>
      </main>
    </div>
  );
};

export default JobCreatePage;