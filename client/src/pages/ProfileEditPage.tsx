import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import employerService, {
  type EmployerProfile,
  type Company,
  type UpdateEmployerProfilePayload,
  type UpdateCompanyPayload,
} from '../services/employerService';
import api from '../services/api';
import companyService from '../services/companyService';
import workerService, {
  type WorkerProfile,
  type UpdateWorkerProfilePayload,
} from '../services/workerService';
import ProfileAssistant from '../components/ProfileAssistant';

const fieldLabel = {
  employer_type: 'Tipo de empleador',
  bio: 'Bio',
  years_as_employer: 'Años como empleador',
  company_name: 'Nombre de la empresa',
  company_rif: 'RIF',
  company_description: 'Descripción',
  company_website: 'Sitio web',
  company_phone: 'Teléfono',
  company_email: 'Correo',
  company_size: 'Tamaño',
  industry: 'Industria',
  years_of_experience: 'Años de experiencia',
  availability_status: 'Disponibilidad',
  rate_type: 'Tipo de tarifa',
  rate_amount: 'Monto de tarifa',
  rate_currency: 'Moneda',
  base_location_address: 'Dirección base',
  identity_document_type_enum: 'Tipo de documento',
  identity_document_number: 'Número de documento',
};

const ProfileEditPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Empleador y empresa
  const [employer, setEmployer] = useState<EmployerProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [attachQuery, setAttachQuery] = useState('');
  const [selectedAttachCompanyId, setSelectedAttachCompanyId] = useState<string>('');
  const [attachLoading, setAttachLoading] = useState(false);
  const [attachError, setAttachError] = useState('');

  // Trabajador
  const [worker, setWorker] = useState<WorkerProfile | null>(null);

  // Form state
  const [employerForm, setEmployerForm] = useState<UpdateEmployerProfilePayload>({});
  const [companyForm, setCompanyForm] = useState<UpdateCompanyPayload>({});
  const [workerForm, setWorkerForm] = useState<UpdateWorkerProfilePayload>({});
  // Logo para creación de nueva empresa (archivo y preview local)
  const [newCompanyLogoFile, setNewCompanyLogoFile] = useState<File | null>(null);
  const [newCompanyLogoPreview, setNewCompanyLogoPreview] = useState<string | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement | null>(null);
  const newCompanyLogoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // Carga de datos según rol
        if (user.role === 'employer') {
          const [emp, comp] = await Promise.all([
            employerService.getMyProfile().catch(() => null),
            employerService.getMyCompany().catch(() => null),
          ]);
          setEmployer(emp);
          setCompany(comp);
          // Si el empleador es tipo company pero no tiene empresa vinculada, precargar listado
          if (emp?.employer_type === 'company' && !comp) {
            try {
              const list = await companyService.listAll();
              setAvailableCompanies(list);
            } catch (_) {
              // ignorar errores de listado
            }
          }
          if (emp) {
            setEmployerForm({
              employer_type: emp.employer_type,
              bio: emp.bio ?? '',
              years_as_employer: emp.years_as_employer ?? undefined,
            });
          }
          if (comp) {
            setCompanyForm({
              company_name: comp.company_name ?? '',
              company_rif: comp.company_rif ?? '',
              company_description: comp.company_description ?? '',
              company_website: comp.company_website ?? '',
              company_phone: comp.company_phone ?? '',
              company_email: comp.company_email ?? '',
              industry: comp.industry ?? undefined,
              company_size: comp.company_size ?? undefined,
              employee_count: comp.employee_count ?? undefined,
              founded_year: comp.founded_year ?? undefined,
              company_logo_url: comp.company_logo_url ?? '',
              company_address: comp.company_address ?? undefined,
            });
          }
        }
        if (user.role === 'worker') {
          const w = await workerService.getMyProfile().catch(() => null);
          setWorker(w);
          if (w) {
            setWorkerForm({
              bio: w.bio ?? '',
              years_of_experience: w.years_of_experience ?? undefined,
              availability_status: w.availability_status ?? '',
              rate_type: w.rate_type ?? '',
              rate_amount: w.rate_amount ?? undefined,
              rate_currency: w.rate_currency ?? '',
              base_location_address: w.base_location_address ?? '',
              identity_document_type_enum: w.identity_document_type_enum ?? undefined,
              identity_document_number: w.identity_document_number ?? '',
            });
          }
        }
      } catch (err: any) {
        setError('No se pudieron cargar los datos de perfil.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const isEmployer = user?.role === 'employer';
  const isWorker = user?.role === 'worker';

  const handleEmployerChange = (field: keyof UpdateEmployerProfilePayload, value: any) => {
    setEmployerForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleCompanyChange = (field: keyof UpdateCompanyPayload, value: any) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleWorkerChange = (field: keyof UpdateWorkerProfilePayload, value: any) => {
    setWorkerForm((prev) => ({ ...prev, [field]: value }));
  };

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    const isValidUrl = (u: string) => {
      try {
        // Requiere protocolo explícito para garantizar URL válida
        const parsed = new URL(u);
        return !!parsed.protocol && (parsed.protocol === 'http:' || parsed.protocol === 'https:');
      } catch {
        return false;
      }
    };
    const hasProtocol = (u: string) => /^https?:\/\//i.test(u);
    if (isEmployer) {
      if (employerForm.employer_type && !['individual', 'company'].includes(employerForm.employer_type)) {
        errs.push('El tipo de empleador no es válido.');
      }
      if (typeof employerForm.years_as_employer === 'number' && employerForm.years_as_employer < 0) {
        errs.push('Años como empleador debe ser mayor o igual a 0.');
      }
      if (employer?.employer_type === 'company' && company) {
        const rif = companyForm.company_rif?.trim();
        if (rif && rif.length < 6) {
          errs.push('El RIF debe tener al menos 6 caracteres.');
        }
        const email = companyForm.company_email?.trim();
        if (email && !email.includes('@')) {
          errs.push('Correo de empresa inválido.');
        }
        const website = companyForm.company_website?.trim();
        if (website && !hasProtocol(website)) {
          // Sugerencia suave: lo completaremos automáticamente al salir del campo o al guardar
          // pero aun así indicamos que debe incluir protocolo para feedback inmediato
          errs.push('El sitio web debe incluir protocolo (http(s)://). Se autocompletará.');
        } else if (website && !isValidUrl(website)) {
          errs.push('El sitio web debe ser una URL válida (incluye http(s)://).');
        }
      }
    }
    if (isWorker) {
      if (typeof workerForm.years_of_experience === 'number' && workerForm.years_of_experience < 0) {
        errs.push('Años de experiencia debe ser mayor o igual a 0.');
      }
      if (typeof workerForm.rate_amount === 'number' && workerForm.rate_amount < 0) {
        errs.push('El monto de la tarifa debe ser mayor o igual a 0.');
      }
    }
    return errs;
  }, [isEmployer, isWorker, employerForm, companyForm, workerForm, employer, company, worker]);

  const [submittingState, setSubmittingState] = useState(false);
  const canSubmit = useMemo(() => !submittingState && validationErrors.length === 0 && !!user, [submittingState, validationErrors, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!canSubmit) return;
    setSubmittingState(true);
    setError('');
    setSuccess('');
    const normalizeOptionalString = (v?: string) => {
      const s = (v ?? '').trim();
      return s.length ? s : undefined;
    };
    try {
      if (isEmployer && employer) {
        await employerService.updateProfile(employer.employer_id, {
          employer_type: employerForm.employer_type,
          bio: normalizeOptionalString(employerForm.bio),
          years_as_employer: employerForm.years_as_employer,
        });
      }
      if (isWorker && worker) {
        await workerService.updateMyProfile({
          bio: normalizeOptionalString(workerForm.bio),
          years_of_experience: workerForm.years_of_experience,
          availability_status: normalizeOptionalString(workerForm.availability_status),
          rate_type: normalizeOptionalString(workerForm.rate_type),
          rate_amount: workerForm.rate_amount,
          rate_currency: normalizeOptionalString(workerForm.rate_currency),
          base_location_address: normalizeOptionalString(workerForm.base_location_address),
          identity_document_type_enum: workerForm.identity_document_type_enum,
          identity_document_number: normalizeOptionalString(workerForm.identity_document_number),
        });
      }
      if (isEmployer && employer?.employer_type === 'company' && company) {
        await employerService.updateCompany(company.company_id, {
          company_name: normalizeOptionalString(companyForm.company_name),
          company_rif: normalizeOptionalString(companyForm.company_rif),
          company_description: normalizeOptionalString(companyForm.company_description),
          company_website: normalizeOptionalString(companyForm.company_website),
          company_phone: normalizeOptionalString(companyForm.company_phone),
          company_email: normalizeOptionalString(companyForm.company_email),
          industry: companyForm.industry,
          company_size: companyForm.company_size,
          employee_count: companyForm.employee_count,
          founded_year: companyForm.founded_year,
          company_logo_url: normalizeOptionalString(companyForm.company_logo_url),
          company_address: companyForm.company_address,
        });
      }
      setSuccess('Cambios guardados correctamente.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo guardar.');
    } finally {
      setSubmittingState(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!user || !isEmployer) return;
    setAttachLoading(true);
    setAttachError('');
    setError('');
    setSuccess('');
    const normalizeOptionalString = (v?: string) => {
      const s = (v ?? '').trim();
      return s.length ? s : undefined;
    };
    try {
      const name = (companyForm.company_name ?? '').trim();
      const rif = (companyForm.company_rif ?? '').trim();
      if (!name || !rif) {
        setAttachError('Nombre y RIF son obligatorios para crear empresa.');
        return;
      }
      const payload = {
        company_name: name,
        company_rif: rif,
        company_description: normalizeOptionalString(companyForm.company_description),
        company_website: normalizeOptionalString(companyForm.company_website),
        company_phone: normalizeOptionalString(companyForm.company_phone),
        company_email: normalizeOptionalString(companyForm.company_email),
        industry: companyForm.industry,
        company_size: companyForm.company_size,
        employee_count: companyForm.employee_count,
        founded_year: companyForm.founded_year,
        company_logo_url: normalizeOptionalString(companyForm.company_logo_url),
        company_address: companyForm.company_address,
      } as UpdateCompanyPayload;
      await employerService.createCompany(payload as any);
      const newCompany = await employerService.getMyCompany();
      // Si se seleccionó un archivo de logo para nueva empresa, subirlo inmediatamente
      if (newCompany && newCompany.company_id && newCompanyLogoFile) {
        try {
          const updated = await employerService.uploadCompanyLogo(newCompany.company_id, newCompanyLogoFile);
          setCompany(updated);
        } catch (uploadErr: any) {
          // No bloquear la creación si falla el upload; solo notificar
          setAttachError(uploadErr?.response?.data?.message || 'La empresa fue creada, pero falló la subida del logo.');
          setCompany(newCompany);
        }
      } else {
        setCompany(newCompany);
      }
      setSuccess('Empresa creada y vinculada correctamente.');
    } catch (err: any) {
      setAttachError(err?.response?.data?.message || 'No se pudo crear la empresa.');
    } finally {
      setAttachLoading(false);
    }
  };

  const handleAttachCompany = async () => {
    if (!user || !isEmployer) return;
    if (!selectedAttachCompanyId) {
      setAttachError('Selecciona una empresa de la lista para vincular.');
      return;
    }
    setAttachLoading(true);
    setAttachError('');
    setError('');
    setSuccess('');
    try {
      await employerService.attachCompany(selectedAttachCompanyId);
      const newCompany = await employerService.getMyCompany();
      setCompany(newCompany);
      setSuccess('Empresa vinculada correctamente.');
    } catch (err: any) {
      setAttachError(err?.response?.data?.message || 'No se pudo vincular la empresa.');
    } finally {
      setAttachLoading(false);
    }
  };

  const handleCompanyLogoUpload = async (file: File) => {
    if (!file) return;
    if (!company) {
      setError('Primero crea o vincula una empresa antes de subir el logo.');
      return;
    }
    try {
      setSubmittingState(true);
      setError('');
      setSuccess('');
      const updated = await employerService.uploadCompanyLogo(company.company_id, file);
      setCompany(updated);
      setCompanyForm((prev) => ({ ...prev, company_logo_url: updated.company_logo_url ?? prev.company_logo_url }));
      setSuccess('Logo subido correctamente.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo subir el logo.');
    } finally {
      setSubmittingState(false);
    }
  };

  const handleRemoveCompanyLogo = async () => {
    if (!company) return;
    try {
      setSubmittingState(true);
      setError('');
      setSuccess('');
      const updated = await employerService.updateCompany(company.company_id, { company_logo_url: null });
      setCompany(updated);
      setCompanyForm((prev) => ({ ...prev, company_logo_url: updated.company_logo_url ?? '' }));
      setSuccess('Logo eliminado correctamente.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo eliminar el logo.');
    } finally {
      setSubmittingState(false);
    }
  };

  const handleSuggestion = (field: string, suggestion: string) => {
    if (field === 'bio') {
      if (isEmployer) {
        setEmployerForm(prev => ({ ...prev, bio: suggestion }));
      } else if (isWorker) {
        setWorkerForm(prev => ({ ...prev, bio: suggestion }));
      }
    } else if (field === 'company_description') {
      setCompanyForm(prev => ({ ...prev, company_description: suggestion }));
    } else if (field === 'skills') {
      // Note: If you add a skills field later, you can update this
      // For now, let's just add it to bio as a placeholder
      if (isWorker) {
        setWorkerForm(prev => ({ ...prev, bio: (prev.bio || '') + '\n\nHabilidades:\n' + suggestion }));
      }
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="page-title">Editar perfil</h1>
          {!user && <p>Cargando…</p>}
          {user && (
            <div className="login-form edit-profile-form">
              <div className="edit-profile-header">
                <div className="edit-profile-summary">
                  <p className="page-subtitle" style={{ margin: 0 }}>Actualiza tu información y mantén tu perfil al día</p>
                </div>
                <div className="hero-actions edit-profile-header-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: 8, maxWidth: 'none' }}>
                  <Link
                    to="/profile"
                    className="btn btn-secondary"
                    title="Volver al perfil"
                    aria-label="Volver al perfil"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, padding: 0 }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 12H5" />
                      <path d="M12 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    title="Guardar cambios"
                    aria-label="Guardar cambios"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, padding: 0 }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M17 21v-8H7v8" />
                      <path d="M7 3v5h8" />
                    </svg>
                  </button>
                </div>
              </div>

              {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
              {success && <div className="success-message" style={{ marginTop: 12 }}>{success}</div>}

              {/* Bloque Worker */}
              {isWorker && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-title">Perfil de Trabajador</div>
                  {loading && <p>Cargando datos…</p>}
                  {!loading && (
                    worker ? (
                      <>
                        <div className="edit-profile-grid">
                          <div className="edit-profile-field edit-profile-field-span">
                            <label className="form-label">{fieldLabel.bio}</label>
                            <textarea
                              className="form-input edit-profile-textarea"
                              value={workerForm.bio ?? ''}
                              onChange={(e) => handleWorkerChange('bio', e.target.value)}
                              rows={4}
                            />
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.years_of_experience}</label>
                            <input
                              type="number"
                              min={0}
                              className="form-input"
                              value={workerForm.years_of_experience ?? ''}
                              onChange={(e) => handleWorkerChange('years_of_experience', e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.availability_status}</label>
                            <select
                              className="form-input"
                              value={workerForm.availability_status ?? ''}
                              onChange={(e) => handleWorkerChange('availability_status', e.target.value as UpdateWorkerProfilePayload['availability_status'])}
                            >
                              <option value="">Selecciona…</option>
                              <option value="AVAILABLE">Disponible</option>
                              <option value="BUSY">Ocupado</option>
                              <option value="UNAVAILABLE">No disponible</option>
                            </select>
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.rate_type}</label>
                            <select
                              className="form-input"
                              value={workerForm.rate_type ?? ''}
                              onChange={(e) => handleWorkerChange('rate_type', e.target.value)}
                            >
                              <option value="">Selecciona…</option>
                              <option value="hourly">Por hora</option>
                              <option value="fixed">Fija</option>
                            </select>
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label" htmlFor="rate_amount">{fieldLabel.rate_amount}</label>
                            <input
                              id="rate_amount"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={0.01}
                              className="form-input"
                              aria-describedby="rate-amount-hint"
                              value={workerForm.rate_amount ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') return handleWorkerChange('rate_amount', undefined);
                                const parsed = Number(raw.replace(',', '.'));
                                handleWorkerChange('rate_amount', Number.isNaN(parsed) ? undefined : parsed);
                              }}
                              placeholder="Ej. 15"
                            />
                            <small id="rate-amount-hint" className="form-hint">Ingresa un número mayor o igual a 0.</small>
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.rate_currency}</label>
                            <select
                              className="form-input"
                              value={workerForm.rate_currency ?? ''}
                              onChange={(e) => handleWorkerChange('rate_currency', e.target.value)}
                            >
                              <option value="">Selecciona…</option>
                              <option value="VES">VES</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                          <div className="edit-profile-field edit-profile-field-span">
                            <label className="form-label">{fieldLabel.base_location_address}</label>
                            <input
                              className="form-input"
                              value={workerForm.base_location_address ?? ''}
                              onChange={(e) => handleWorkerChange('base_location_address', e.target.value)}
                            />
                          </div>
                          
                          {/* Documento de identidad en la misma fila */}
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.identity_document_type_enum}</label>
                            <select
                              className="form-input"
                              value={workerForm.identity_document_type_enum ?? ''}
                              onChange={(e) => handleWorkerChange('identity_document_type_enum', e.target.value as UpdateWorkerProfilePayload['identity_document_type_enum'])}
                            >
                              <option value="">Selecciona…</option>
                              <option value="V">V</option>
                              <option value="E">E</option>
                              <option value="P">P</option>
                              <option value="G">G</option>
                            </select>
                          </div>
                          <div className="edit-profile-field">
                            <label className="form-label">{fieldLabel.identity_document_number}</label>
                            <input
                              className="form-input"
                              value={workerForm.identity_document_number ?? ''}
                              onChange={(e) => handleWorkerChange('identity_document_number', e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="muted">Aún no has creado tu perfil de trabajador.</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Link to="/onboarding/worker" className="btn btn-google">Ir a configuración inicial</Link>
                        </div>
                      </>
                    )
                  )}
                </div>
              )}

              {/* Bloque Employer */}
              {isEmployer && (
                <div style={{ marginTop: 16 }}>
                  <div className="section-title">Perfil de Empleador</div>
                  {loading && <p>Cargando datos…</p>}
                  {!loading && (
                    <>
                      <div className="edit-profile-grid">
                        <div className="edit-profile-field edit-profile-field-span">
                          <label className="form-label">{fieldLabel.bio}</label>
                          <textarea
                            className="form-input edit-profile-textarea"
                            value={employerForm.bio ?? ''}
                            onChange={(e) => handleEmployerChange('bio', e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="edit-profile-field">
                          <label className="form-label">{fieldLabel.years_as_employer}</label>
                          <input
                            type="number"
                            min={0}
                            className="form-input"
                            value={employerForm.years_as_employer ?? ''}
                            onChange={(e) => handleEmployerChange('years_as_employer', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>

                      {employer?.employer_type === 'company' && company && (
                        <div style={{ marginTop: 16 }}>
                          <div className="section-title">Empresa</div>
                          <div className="edit-profile-grid">
                            <div className="edit-profile-field edit-profile-field-span">
                              <label className="form-label">Logo</label>
                              <div className="edit-profile-logo-card">
                                <div className="edit-profile-logo-preview">
                                  {(companyForm.company_logo_url || company?.company_logo_url) ? (
                                    <img
                                      src={(() => {
                                        const raw = (companyForm.company_logo_url || company?.company_logo_url) as string;
                                        return raw?.startsWith('http') ? raw : (api.defaults.baseURL + raw);
                                      })()}
                                      alt="Logo de la empresa"
                                      style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid #ddd' }}
                                    />
                                  ) : (
                                    <span className="muted" style={{ fontSize: 12 }}>Sin logo</span>
                                  )}
                                </div>
                                <div className="edit-profile-logo-actions">
                                  <input
                                    ref={companyLogoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) handleCompanyLogoUpload(f);
                                      e.currentTarget.value = '';
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-secondary edit-profile-icon-btn"
                                    title={(companyForm.company_logo_url || company?.company_logo_url) ? 'Cambiar logo' : 'Subir logo'}
                                    aria-label={(companyForm.company_logo_url || company?.company_logo_url) ? 'Cambiar logo' : 'Subir logo'}
                                    onClick={() => companyLogoInputRef.current?.click()}
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
                                      <polyline points="17 8 12 3 7 8" />
                                      <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                  </button>
                                  <span className="edit-profile-logo-meta">
                                    {(companyForm.company_logo_url || company?.company_logo_url) ? 'Cambiar logo actual' : 'Subir logo'}
                                  </span>
                                  {(companyForm.company_logo_url || company?.company_logo_url) && (
                                    <button
                                      type="button"
                                      className="btn btn-secondary edit-profile-icon-btn"
                                      title="Quitar logo"
                                      aria-label="Quitar logo"
                                      onClick={handleRemoveCompanyLogo}
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
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.company_name}</label>
                              <input
                                className="form-input"
                                value={companyForm.company_name ?? ''}
                                onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                              />
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.company_rif}</label>
                              <input
                                className="form-input"
                                value={companyForm.company_rif ?? ''}
                                onChange={(e) => handleCompanyChange('company_rif', e.target.value)}
                              />
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.industry}</label>
                              <select
                                className="form-input"
                                value={companyForm.industry ?? ''}
                                onChange={(e) => handleCompanyChange('industry', e.target.value as UpdateCompanyPayload['industry'])}
                              >
                                <option value="">Selecciona…</option>
                                <option value="technology">Tecnología</option>
                                <option value="healthcare">Salud</option>
                                <option value="finance">Finanzas</option>
                                <option value="education">Educación</option>
                                <option value="retail">Retail</option>
                                <option value="manufacturing">Manufactura</option>
                                <option value="construction">Construcción</option>
                                <option value="hospitality">Hospitalidad</option>
                                <option value="transportation">Transporte</option>
                                <option value="agriculture">Agricultura</option>
                                <option value="energy">Energía</option>
                                <option value="media">Medios</option>
                                <option value="real_estate">Bienes Raíces</option>
                                <option value="consulting">Consultoría</option>
                                <option value="non_profit">ONG</option>
                                <option value="government">Gobierno</option>
                                <option value="other">Otro</option>
                              </select>
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.company_size}</label>
                              <select
                                className="form-input"
                                value={companyForm.company_size ?? ''}
                                onChange={(e) => handleCompanyChange('company_size', e.target.value as UpdateCompanyPayload['company_size'])}
                              >
                                <option value="">Selecciona…</option>
                                <option value="startup">Startup</option>
                                <option value="small">Pequeña</option>
                                <option value="medium">Mediana</option>
                                <option value="large">Grande</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.company_email}</label>
                              <input
                                type="email"
                                className="form-input"
                                value={companyForm.company_email ?? ''}
                                onChange={(e) => handleCompanyChange('company_email', e.target.value)}
                              />
                            </div>
                            <div className="edit-profile-field">
                              <label className="form-label">{fieldLabel.company_phone}</label>
                              <input
                                className="form-input"
                                value={companyForm.company_phone ?? ''}
                                onChange={(e) => handleCompanyChange('company_phone', e.target.value)}
                              />
                            </div>
                            <div className="edit-profile-field edit-profile-field-span">
                              <label className="form-label">{fieldLabel.company_website}</label>
                              <input
                                type="url"
                                className="form-input"
                                value={companyForm.company_website ?? ''}
                                onChange={(e) => handleCompanyChange('company_website', e.target.value)}
                                onBlur={(e) => {
                                  const s = e.target.value.trim();
                                  if (s && !/^https?:\/\//i.test(s)) {
                                    handleCompanyChange('company_website', `https://${s}`);
                                  }
                                }}
                                placeholder="https://tuempresa.com"
                              />
                            </div>
                            <div className="edit-profile-field edit-profile-field-span">
                              <label className="form-label">Descripción</label>
                              <textarea
                                className="form-input edit-profile-textarea"
                                rows={5}
                                value={companyForm.company_description ?? ''}
                                onChange={(e) => handleCompanyChange('company_description', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {employer?.employer_type === 'company' && !company && (
                        <div style={{ marginTop: 16 }}>
                          <div className="section-title">Empresa</div>
                          <p className="muted">No tienes una empresa asociada. Puedes crear una nueva o vincular una existente.</p>

                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Crear nueva empresa</div>
                            <div className="edit-profile-grid">
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.company_name}</label>
                                <input
                                  className="form-input"
                                  value={companyForm.company_name ?? ''}
                                  onChange={(e) => handleCompanyChange('company_name', e.target.value)}
                                />
                              </div>
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.company_rif}</label>
                                <input
                                  className="form-input"
                                  value={companyForm.company_rif ?? ''}
                                  onChange={(e) => handleCompanyChange('company_rif', e.target.value)}
                                />
                              </div>
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.industry}</label>
                                <select
                                  className="form-input"
                                  value={companyForm.industry ?? ''}
                                  onChange={(e) => handleCompanyChange('industry', e.target.value as UpdateCompanyPayload['industry'])}
                                >
                                  <option value="">Selecciona…</option>
                                  <option value="technology">Tecnología</option>
                                  <option value="healthcare">Salud</option>
                                  <option value="finance">Finanzas</option>
                                  <option value="education">Educación</option>
                                  <option value="retail">Retail</option>
                                  <option value="manufacturing">Manufactura</option>
                                  <option value="construction">Construcción</option>
                                  <option value="hospitality">Hospitalidad</option>
                                  <option value="transportation">Transporte</option>
                                  <option value="agriculture">Agricultura</option>
                                  <option value="energy">Energía</option>
                                  <option value="media">Medios</option>
                                  <option value="real_estate">Bienes Raíces</option>
                                  <option value="consulting">Consultoría</option>
                                  <option value="non_profit">ONG</option>
                                  <option value="government">Gobierno</option>
                                  <option value="other">Otro</option>
                                </select>
                              </div>
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.company_size}</label>
                                <select
                                  className="form-input"
                                  value={companyForm.company_size ?? ''}
                                  onChange={(e) => handleCompanyChange('company_size', e.target.value as UpdateCompanyPayload['company_size'])}
                                >
                                  <option value="">Selecciona…</option>
                                  <option value="startup">Startup</option>
                                  <option value="small">Pequeña</option>
                                  <option value="medium">Mediana</option>
                                  <option value="large">Grande</option>
                                  <option value="enterprise">Enterprise</option>
                                </select>
                              </div>
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.company_email}</label>
                                <input
                                  type="email"
                                  className="form-input"
                                  value={companyForm.company_email ?? ''}
                                  onChange={(e) => handleCompanyChange('company_email', e.target.value)}
                                />
                              </div>
                              <div className="edit-profile-field">
                                <label className="form-label">{fieldLabel.company_phone}</label>
                                <input
                                  className="form-input"
                                  value={companyForm.company_phone ?? ''}
                                  onChange={(e) => handleCompanyChange('company_phone', e.target.value)}
                                />
                              </div>
                              <div className="edit-profile-field edit-profile-field-span">
                                <label className="form-label">{fieldLabel.company_website}</label>
                                <input
                                  type="url"
                                  className="form-input"
                                  value={companyForm.company_website ?? ''}
                                  onChange={(e) => handleCompanyChange('company_website', e.target.value)}
                                  onBlur={(e) => {
                                    const s = e.target.value.trim();
                                    if (s && !/^https?:\/\//i.test(s)) {
                                      handleCompanyChange('company_website', `https://${s}`);
                                    }
                                  }}
                                  placeholder="https://tuempresa.com"
                                />
                              </div>
                              <div className="edit-profile-field edit-profile-field-span">
                                <label className="form-label">Descripción</label>
                                <textarea
                                  className="form-input edit-profile-textarea"
                                  rows={5}
                                  value={companyForm.company_description ?? ''}
                                  onChange={(e) => handleCompanyChange('company_description', e.target.value)}
                                />
                              </div>
                              <div className="edit-profile-field edit-profile-field-span">
                                <label className="form-label">Logo de la empresa (imagen)</label>
                                <div className="edit-profile-logo-card">
                                  <div className="edit-profile-logo-preview">
                                    {newCompanyLogoPreview ? (
                                      <img src={newCompanyLogoPreview} alt="Logo preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid #ddd' }} />
                                    ) : (
                                      <span className="muted" style={{ fontSize: 12 }}>Sin logo</span>
                                    )}
                                  </div>
                                  <div className="edit-profile-logo-actions">
                                    <input
                                      ref={newCompanyLogoInputRef}
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        setNewCompanyLogoFile(f);
                                        if (f) {
                                          const url = URL.createObjectURL(f);
                                          setNewCompanyLogoPreview(url);
                                        } else {
                                          setNewCompanyLogoPreview(null);
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-secondary edit-profile-icon-btn"
                                      title={newCompanyLogoPreview ? 'Cambiar logo' : 'Subir logo'}
                                      aria-label={newCompanyLogoPreview ? 'Cambiar logo' : 'Subir logo'}
                                      onClick={() => newCompanyLogoInputRef.current?.click()}
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
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                      </svg>
                                    </button>
                                    <span className="edit-profile-logo-meta">
                                      {newCompanyLogoPreview ? 'Cambiar logo seleccionado' : 'Subir logo'}
                                    </span>
                                    {newCompanyLogoPreview && (
                                      <button
                                        type="button"
                                        className="btn btn-secondary edit-profile-icon-btn"
                                        title="Quitar logo"
                                        aria-label="Quitar logo"
                                        onClick={() => { setNewCompanyLogoFile(null); setNewCompanyLogoPreview(null); }}
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
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="hero-actions" style={{ marginTop: 8 }}>
                              <button className="btn btn-primary" onClick={handleCreateCompany} disabled={attachLoading}>Crear y vincular empresa</button>
                            </div>
                          </div>

                          <div style={{ marginTop: 20 }}>
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>Vincular empresa existente</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                              <div>
                                <label className="form-label">Buscar por nombre</label>
                                <input
                                  className="form-input"
                                  value={attachQuery}
                                  onChange={(e) => setAttachQuery(e.target.value)}
                                  placeholder="Escribe para filtrar…"
                                />
                              </div>
                              <div>
                                <label className="form-label">Selecciona empresa</label>
                                <select
                                  className="form-input"
                                  value={selectedAttachCompanyId}
                                  onChange={(e) => setSelectedAttachCompanyId(e.target.value)}
                                >
                                  <option value="">— Selecciona —</option>
                                  {availableCompanies
                                    .filter((c) => c.company_name.toLowerCase().includes(attachQuery.toLowerCase()))
                                    .map((c) => (
                                      <option key={c.company_id} value={c.company_id}>
                                        {c.company_name} ({c.company_rif})
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                            <div className="hero-actions" style={{ marginTop: 8 }}>
                              <button className="btn btn-google" onClick={handleAttachCompany} disabled={attachLoading || !selectedAttachCompanyId}>Vincular empresa seleccionada</button>
                            </div>
                            {attachError && <div className="error-message" style={{ marginTop: 8 }}>{attachError}</div>}
                          </div>
                        </div>
                      )}

                      {validationErrors.length > 0 && (
                        <div className="error-message" style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 600 }}>Corrige los siguientes campos:</div>
                          <ul style={{ margin: '6px 0 0 16px' }}>
                            {validationErrors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      {(isEmployer || isWorker) && (
        <ProfileAssistant 
          userRole={isEmployer ? 'employer' : 'worker'}
          currentProfile={isEmployer ? (company ? { ...employerForm, ...companyForm } : employerForm) : workerForm}
          onSuggestion={handleSuggestion}
        />
      )}
    </div>
  );
};

export default ProfileEditPage;
