import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import employerService from '../services/employerService';
import type { EmployerProfile, Company } from '../services/employerService';
import workerService, { type WorkerProfile } from '../services/workerService';
import userService from '../services/userService';
import authService from '../services/authService';
import api from '../services/api';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [extraError, setExtraError] = useState('');
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [workerLoading, setWorkerLoading] = useState(false);
  const [workerError, setWorkerError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [logoDeleteLoading, setLogoDeleteLoading] = useState(false);
  const [logoDeleteError, setLogoDeleteError] = useState('');

  const createdDate = user?.createdAt ? new Date(user.createdAt) : null;
  const initials = (
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => (n ? n[0].toUpperCase() : ''))
      .filter(Boolean)
      .slice(0, 2)
      .join('') || (user?.email ? user.email[0].toUpperCase() : '?')
  );
  const roleLabel = user?.role === 'employer' ? 'Empleador' : user?.role === 'worker' ? 'Trabajador' : 'Usuario';

  useEffect(() => {
    const loadEmployerData = async () => {
      if (!user || user.role !== 'employer') return;
      setExtraError('');
      setExtraLoading(true);
      try {
        const [employerProfile, companyData] = await Promise.all([
          employerService.getMyProfile().catch(() => null),
          employerService.getMyCompany().catch(() => null),
        ]);
        setEmployer(employerProfile);
        setCompany(companyData);
      } catch (err: any) {
        setExtraError('No se pudieron cargar los datos de empleador.');
      } finally {
        setExtraLoading(false);
      }
    };
    loadEmployerData();
  }, [user]);

  useEffect(() => {
    const loadWorkerData = async () => {
      if (!user || user.role !== 'worker') return;
      setWorkerError('');
      setWorkerLoading(true);
      try {
        const profile = await workerService.getMyProfile();
        setWorker(profile);
      } catch (err: any) {
        setWorkerError('No se pudieron cargar los datos de trabajador.');
      } finally {
        setWorkerLoading(false);
      }
    };
    loadWorkerData();
  }, [user]);

  const formatAvailability = (status?: string) => {
    if (!status) return '';
    const s = status.toUpperCase();
    switch (s) {
      case 'AVAILABLE':
      case 'DISPONIBLE':
        return 'Disponible';
      case 'UNAVAILABLE':
      case 'NO_DISPONIBLE':
        return 'No disponible';
      case 'BUSY':
      case 'OCUPADO':
        return 'Ocupado';
      default:
        return status; // fallback al valor original
    }
  };

  const formatRateType = (rateType?: string) => {
    if (!rateType) return '';
    const r = rateType.toUpperCase();
    switch (r) {
      case 'HOURLY':
      case 'POR_HORA':
        return 'Por hora';
      case 'DAILY':
      case 'POR_DIA':
        return 'Por día';
      case 'WEEKLY':
      case 'POR_SEMANA':
        return 'Por semana';
      case 'MONTHLY':
      case 'POR_MES':
        return 'Por mes';
      case 'FIXED':
      case 'FIJO':
        return 'Fijo';
      default:
        return rateType;
    }
  };

  const formatDocumentType = (t?: WorkerProfile['identity_document_type_enum']) => {
    switch (t) {
      case 'V':
        return 'Cédula (V)';
      case 'E':
        return 'Cédula (E)';
      case 'P':
        return 'Pasaporte';
      case 'G':
        return 'RIF (G)';
      default:
        return t || '';
    }
  };

  const formatIndustry = (value?: string) => {
    if (!value) return '';
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
      real_estate: 'Bienes Raíces',
      consulting: 'Consultoría',
      non_profit: 'Sin Fines de Lucro',
      government: 'Gobierno',
      other: 'Otra',
    };
    return map[value] || value;
  };

  const formatCompanySize = (value?: string) => {
    if (!value) return '';
    const map: Record<string, string> = {
      startup: 'Startup',
      small: 'Pequeña',
      medium: 'Mediana',
      large: 'Grande',
      enterprise: 'Corporación',
    };
    return map[value] || value;
  };

  const getCurrencySymbol = (code?: string) => {
    const c = (code || '').toUpperCase();
    switch (c) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'VES':
      case 'VEF':
        return 'Bs.';
      case 'COP':
        return '$';
      case 'MXN':
        return '$';
      case 'BRL':
        return 'R$';
      case 'ARS':
        return '$';
      case 'CLP':
        return '$';
      case 'PEN':
        return 'S/';
      case 'PYG':
        return '₲';
      case 'UYU':
        return '$U';
      case 'DOP':
        return 'RD$';
      case 'CRC':
        return '₡';
      default:
        return code || '';
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content profile-page-content">
          <h1 className="page-title">Mi perfil</h1>
          {user ? (
            <div className="login-form profile-wide">
              <div className="profile-header">
                <div className="profile-id" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="profile-avatar" aria-hidden>{initials}</div>
                  <div className="profile-title">
                    <h2 style={{ margin: 0 }}>Tu información</h2>
                  </div>
                </div>
                <div className="hero-actions" style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <a
                    href="/profile/edit"
                    className="icon-button"
                    aria-label="Editar perfil"
                    title="Editar perfil"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Borrar cuenta"
                    title="Borrar cuenta"
                    aria-busy={deleteLoading}
                    onClick={async () => {
                      if (deleteLoading) return;
                      setDeleteError('');
                      const ok = window.confirm('¿Seguro que quieres borrar tu cuenta? Esta acción es permanente.');
                      if (!ok) return;
                      setDeleteLoading(true);
                      try {
                        await userService.deleteMe();
                        authService.logout();
                        navigate('/');
                      } catch (err: any) {
                        setDeleteError(err?.response?.data?.message || 'No se pudo borrar la cuenta.');
                      } finally {
                        setDeleteLoading(false);
                      }
                    }}
                    disabled={deleteLoading}
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
                </div>
              </div>

              <div className="profile-details">
                {deleteError && <div className="error-message" role="alert">{deleteError}</div>}
                <div className="row"><span className="label">Nombre</span><span className="value">{user.firstName} {user.lastName}</span></div>
                <div className="row"><span className="label">Email</span><span className="value">{user.email}</span></div>
                {user.phone && (
                  <div className="row"><span className="label">Teléfono</span><span className="value">{user.phone}</span></div>
                )}
                {createdDate && (
                  <div className="row"><span className="label">Creado</span><span className="value">{createdDate.toLocaleDateString()}</span></div>
                )}
              </div>

              {user.role === 'worker' && (
                <div style={{ marginTop: 24 }}>
                  <div className="section-title">Perfil de Trabajador</div>
                  {workerLoading && <p>Cargando datos de trabajador…</p>}
                  {workerError && <div className="error-message">{workerError}</div>}

                  {!workerLoading && !worker && (
                    <div className="empty-state">
                      Aún no has creado tu perfil de trabajador.
                      <Link to="/onboarding/worker" className="link-brand">Crear perfil</Link>
                    </div>
                  )}

                  {worker && (
                    <div className="profile-details" style={{ marginTop: 8 }}>
                      <div className="row stack" style={{ marginBottom: 8 }}><span className="label">Bio</span><span className="value profile-clamped-text">{worker.bio}</span></div>
                      <div className="row"><span className="label">Años de experiencia</span><span className="value">{worker.years_of_experience}</span></div>
                      <div className="row"><span className="label">Disponibilidad</span><span className="value"><span className="badge badge-withdrawn">{formatAvailability(worker.availability_status)}</span></span></div>
                      <div className="row"><span className="label">Tarifa</span><span className="value">{formatRateType(worker.rate_type)} {getCurrencySymbol(worker.rate_currency)}{worker.rate_amount} {worker.rate_currency ? `(${worker.rate_currency})` : ''}</span></div>
                      {worker.cv_url && (
                        <div className="row">
                          <span className="label">CV</span>
                          <span className="value">
                            <a
                              className="btn btn-secondary"
                              href={worker.cv_url?.startsWith('http') ? worker.cv_url : (api.defaults.baseURL + worker.cv_url)}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Ver CV"
                              title="Ver CV"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <path d="M7 10l5 5 5-5" />
                                <path d="M12 15V3" />
                              </svg>
                              
                            </a>
                          </span>
                        </div>
                      )}
                      {worker.base_location_address && (
                        <div className="row"><span className="label">Ubicación base</span><span className="value">{worker.base_location_address}</span></div>
                      )}
                      <div className="row"><span className="label">Documento</span><span className="value">{formatDocumentType(worker.identity_document_type_enum)} {worker.identity_document_number}</span></div>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'employer' && (
                <div style={{ marginTop: 24 }}>
                  <div className="section-title">Perfil de Empleador</div>
                  {extraError && <div className="error-message">{extraError}</div>}
                  {extraLoading && <p>Cargando datos de empleador…</p>}

                  {!extraLoading && !employer && (
                    <div className="empty-state">
                      Aún no has completado tu perfil de empleador.
                      <Link to="/onboarding/employer" className="link-brand">Configurar perfil</Link>
                    </div>
                  )}

                    {employer && (
                    <div className="profile-details" style={{ marginTop: 8 }}>
                      <div className="row"><span className="label">Tipo</span><span className="value">{employer.employer_type === 'company' ? 'Empresa' : 'Individual'}</span></div>
                      {employer.bio && (
                        <div className="row stack" style={{ marginBottom: 8 }}><span className="label">Bio</span><span className="value profile-clamped-text">{employer.bio}</span></div>
                      )}
                      {typeof employer.years_as_employer === 'number' && (
                        <div className="row"><span className="label">Años como empleador</span><span className="value">{employer.years_as_employer}</span></div>
                      )}
                    </div>
                  )}

                  {employer?.employer_type === 'company' && (
                    <div style={{ marginTop: 16 }}>
                      <div className="section-title">Empresa</div>
                      {company ? (
                        <div className="profile-details">
                          <div className="row"><span className="label">Nombre</span><span className="value">{company.company_name}</span></div>
                          <div className="row"><span className="label">RIF</span><span className="value">{company.company_rif}</span></div>
                          {company.company_description && (
                            <div className="row stack"><span className="label">Descripción</span><span className="value">{company.company_description}</span></div>
                          )}
                          {company.company_website && (
                            <div className="row"><span className="label">Sitio web</span><span className="value"><a href={company.company_website} target="_blank" rel="noreferrer">{company.company_website}</a></span></div>
                          )}
                          {company.company_email && (
                            <div className="row"><span className="label">Correo</span><span className="value">{company.company_email}</span></div>
                          )}
                          {company.company_phone && (
                            <div className="row"><span className="label">Teléfono</span><span className="value">{company.company_phone}</span></div>
                          )}
                          <div className="row"><span className="label">Industria</span><span className="value">{formatIndustry(company.industry)}</span></div>
                          <div className="row"><span className="label">Tamaño</span><span className="value">{formatCompanySize(company.company_size)}</span></div>
                          {typeof company.employee_count === 'number' && (
                            <div className="row"><span className="label">Empleados</span><span className="value">{company.employee_count}</span></div>
                          )}
                          {typeof company.founded_year === 'number' && (
                            <div className="row"><span className="label">Fundación</span><span className="value">{company.founded_year}</span></div>
                          )}
                          {company.company_logo_url && (
                            <div className="row">
                              <span className="label">Logo</span>
                              <span className="value" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                <img
                                  src={company.company_logo_url?.startsWith('http') ? company.company_logo_url : (api.defaults.baseURL + company.company_logo_url)}
                                  alt="Logo de la empresa"
                                  style={{ maxWidth: 120, maxHeight: 80 }}
                                />
                                <a
                                  className="btn btn-secondary"
                                  href={company.company_logo_url?.startsWith('http') ? company.company_logo_url : (api.defaults.baseURL + company.company_logo_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label="Ver logo"
                                  title="Ver logo"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <path d="M7 10l5 5 5-5" />
                                    <path d="M12 15V3" />
                                  </svg>
                                </a>
                                <button
                                  className="btn btn-secondary"
                                  type="button"
                                  disabled={logoDeleteLoading}
                                  aria-label="Quitar logo"
                                  title="Quitar logo"
                                  onClick={async () => {
                                    if (!company) return;
                                    setLogoDeleteError('');
                                    setLogoDeleteLoading(true);
                                    try {
                                      await employerService.updateCompany(company.company_id, { company_logo_url: null });
                                      const refreshed = await employerService.getMyCompany();
                                      setCompany(refreshed);
                                    } catch (err: any) {
                                      setLogoDeleteError(err?.response?.data?.message || 'No se pudo eliminar el logo.');
                                    } finally {
                                      setLogoDeleteLoading(false);
                                    }
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </button>
                              </span>
                            </div>
                          )}
                          {logoDeleteError && (
                            <div className="error-message" style={{ marginTop: 8 }}>{logoDeleteError}</div>
                          )}
                          {company.company_address && (
                            <div className="row">
                              <span className="label">Dirección</span>
                              <span className="value">
                                {company.company_address.address_line}, {company.company_address.city}, {company.company_address.state}, {company.company_address.country}
                                {company.company_address.postal_code ? `, CP ${company.company_address.postal_code}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="status warn">
                          No has registrado tu empresa aún.
                          <Link to="/onboarding/employer?step=company" style={{ marginLeft: 8 }}>Configurar empresa</Link>
                          <button
                            className="btn btn-secondary"
                            style={{ marginLeft: 8, padding: '6px 10px' }}
                            onClick={async () => {
                              const companyId = window.prompt('Ingresa el ID de la empresa a vincular');
                              if (!companyId) return;
                              setExtraError('');
                              setExtraLoading(true);
                              try {
                                await employerService.attachCompany(companyId);
                                const refreshed = await employerService.getMyCompany();
                                setCompany(refreshed);
                              } catch (err: any) {
                                setExtraError(err?.response?.data?.message || 'No se pudo vincular la empresa.');
                              } finally {
                                setExtraLoading(false);
                              }
                            }}
                          >
                            Vincular empresa existente
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Cargando perfil…</p>
          )}
        </div>
      </header>
    </div>
  );
};

export default ProfilePage;
