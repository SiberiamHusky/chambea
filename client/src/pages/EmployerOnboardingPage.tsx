import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import employerService from '../services/employerService';
import type { CreateCompanyPayload } from '../services/employerService';
import ProfileAssistant from '../components/ProfileAssistant';

const EmployerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<{
    employer_type: 'individual' | 'company';
    bio: string;
    years_as_employer: number | '';
  }>({
    employer_type: 'individual',
    bio: '',
    years_as_employer: '',
  });

  // Permite navegación directa al paso de empresa vía query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get('step');
    const employerType = params.get('employer_type');
    const companyFlag = params.get('company');

    if (step === '2' || step === 'company' || companyFlag === '1') {
      setCurrentStep(2);
      setForm((prev) => ({ ...prev, employer_type: 'company' }));
    } else if (employerType === 'company') {
      setForm((prev) => ({ ...prev, employer_type: 'company' }));
    }
  }, [location.search]);

  // Opciones de industria (etiquetas en español, valores según backend)
  const industryOptions = useMemo(
    () => [
      { value: 'technology', label: 'Tecnología' },
      { value: 'healthcare', label: 'Salud' },
      { value: 'finance', label: 'Finanzas' },
      { value: 'education', label: 'Educación' },
      { value: 'retail', label: 'Retail' },
      { value: 'manufacturing', label: 'Manufactura' },
      { value: 'construction', label: 'Construcción' },
      { value: 'hospitality', label: 'Hospitalidad' },
      { value: 'transportation', label: 'Transporte' },
      { value: 'agriculture', label: 'Agricultura' },
      { value: 'energy', label: 'Energía' },
      { value: 'media', label: 'Medios' },
      { value: 'real_estate', label: 'Bienes Raíces' },
      { value: 'consulting', label: 'Consultoría' },
      { value: 'non_profit', label: 'Sin Fines de Lucro' },
      { value: 'government', label: 'Gobierno' },
      { value: 'other', label: 'Otra' },
    ],
    []
  );

  // Opciones de tamaño de empresa (etiquetas en español, valores según backend)
  const companySizeOptions = useMemo(
    () => [
      { value: 'startup', label: 'Startup' },
      { value: 'small', label: 'Pequeña' },
      { value: 'medium', label: 'Mediana' },
      { value: 'large', label: 'Grande' },
      { value: 'enterprise', label: 'Corporación' },
    ],
    []
  );

  // Opciones de ubicación (ejemplo: Venezuela con estados y ciudades comunes)
  const countryOptions = useMemo(() => ['Venezuela', 'Colombia', 'Argentina'], []);
  const statesByCountry = useMemo(
    () => ({
      Venezuela: ['Distrito Capital', 'Miranda', 'Zulia', 'Carabobo', 'Lara', 'Aragua'],
      Colombia: ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca'],
      Argentina: ['Buenos Aires', 'Córdoba', 'Santa Fe'],
    }),
    []
  );
  const citiesByState = useMemo(
    () => ({
      'Distrito Capital': ['Caracas'],
      Miranda: ['Guarenas', 'Guatire', 'Los Teques'],
      Zulia: ['Maracaibo', 'San Francisco'],
      Carabobo: ['Valencia', 'Puerto Cabello'],
      Lara: ['Barquisimeto', 'Carora'],
      Aragua: ['Maracay', 'La Victoria'],
      'Bogotá D.C.': ['Bogotá'],
      Antioquia: ['Medellín', 'Envigado'],
      'Valle del Cauca': ['Cali', 'Palmira'],
      'Buenos Aires': ['Buenos Aires', 'La Plata'],
      Córdoba: ['Córdoba', 'Villa Carlos Paz'],
      'Santa Fe': ['Rosario', 'Santa Fe'],
    }),
    []
  );

  const [includeAddress, setIncludeAddress] = useState(false);
  const [companyForm, setCompanyForm] = useState<CreateCompanyPayload>({
    company_name: '',
    company_rif: '',
    industry: 'technology',
    company_size: 'startup',
    company_description: '',
    company_website: '',
    company_phone: '',
    company_email: '',
    employee_count: undefined,
    founded_year: undefined,
    company_logo_url: '',
    company_address: undefined,
  });
  // Archivo de logo y preview local para la empresa en onboarding
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Prefijo y número de RIF (solo UI). Se ensamblan en submitCompany
  const [rifPrefix, setRifPrefix] = useState<'J' | 'V' | 'E' | 'G' | 'P' | 'C'>('J');
  const [rifNumber, setRifNumber] = useState('');
  const [rifFieldError, setRifFieldError] = useState('');

  // Cálculo del dígito verificador del RIF (Módulo 11)
  const computeRifCheckDigit = (prefix: 'J' | 'V' | 'E' | 'G' | 'P' | 'C', baseNumber8: string): number => {
    // Valores base por letra (fuente: Wikipedia RIF - Módulo 11)
    const baseMap: Record<string, number> = {
      V: 4,
      E: 8,
      J: 12,
      C: 12,
      P: 16,
      G: 20,
    };
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    const digits = baseNumber8.split('').map(d => Number(d));
    const sumWeights = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
    const total = baseMap[prefix] + sumWeights;
    const dv = 11 - (total % 11);
    return dv < 10 ? dv : 0;
  };

  const rifPreview = useMemo(() => {
    const onlyDigits = (rifNumber || '').replace(/\D/g, '');
    if (onlyDigits.length >= 8) {
      const base8 = onlyDigits.slice(0, 8);
      const dv = computeRifCheckDigit(rifPrefix, base8);
      return `${rifPrefix}-${base8}-${dv}`;
    }
    return '';
  }, [rifPrefix, rifNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('years') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Paso 1: Crear perfil de empleador
      await employerService.createProfile({
        employer_type: form.employer_type,
        bio: form.bio.trim() || undefined,
        years_as_employer: form.years_as_employer === '' ? undefined : Number(form.years_as_employer),
      });
      if (form.employer_type === 'company') {
        setSuccess('Perfil de empleador creado. Ahora registra tu empresa.');
        setCurrentStep(2);
      } else {
        setSuccess('Perfil de empleador creado exitosamente.');
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      [name]: ['employee_count', 'founded_year'].includes(name) ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIncludeAddress(checked);
    setCompanyForm(prev => ({
      ...prev,
      company_address: checked
        ? {
            country: '',
            state: '',
            city: '',
            address_line: '',
            postal_code: '',
            latitude: undefined,
            longitude: undefined,
          }
        : undefined,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      company_address: prev.company_address
        ? {
            ...prev.company_address,
            [name]: value,
          }
        : prev.company_address,
    }));

    // Reset dependencias si cambia país o estado
    if (name === 'country') {
      setCompanyForm(prev => ({
        ...prev,
        company_address: prev.company_address
          ? { ...prev.company_address, state: '', city: '' }
          : prev.company_address,
      }));
    }
    if (name === 'state') {
      setCompanyForm(prev => ({
        ...prev,
        company_address: prev.company_address
          ? { ...prev.company_address, city: '' }
          : prev.company_address,
      }));
    }
  };

  const handleSuggestion = (field: string, suggestion: string) => {
    if (field === 'bio') {
      setForm(prev => ({ ...prev, bio: suggestion }));
    } else if (field === 'company_description') {
      setCompanyForm(prev => ({ ...prev, company_description: suggestion }));
    }
  };

  const submitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setRifFieldError('');
    try {
      // Validación de RIF: formato y dígito verificador
      const rifInput = rifNumber.trim();
      const rifMatch = rifInput.match(/^([0-9]{8})-([0-9])$/);
      if (!rifMatch) {
        setLoading(false);
        setRifFieldError('Formato inválido. Use 8 dígitos + guion + dígito (ej: 12345678-3).');
        return;
      }
      const base8 = rifMatch[1];
      const typedDv = Number(rifMatch[2]);
      const expectedDv = computeRifCheckDigit(rifPrefix, base8);
      if (typedDv !== expectedDv) {
        setLoading(false);
        setRifFieldError(`Dígito verificador incorrecto. Debe ser ${expectedDv}.`);
        return;
      }

      const payload: CreateCompanyPayload = {
        company_name: companyForm.company_name.trim(),
        // Ensamblar RIF: prefijo + 8 dígitos + dígito verificador
        company_rif: `${rifPrefix}-${base8}-${expectedDv}`,
        industry: companyForm.industry,
        company_size: companyForm.company_size,
        company_description: companyForm.company_description?.trim() || undefined,
        company_website: companyForm.company_website?.trim() || undefined,
        company_phone: companyForm.company_phone?.trim() || undefined,
        company_email: companyForm.company_email?.trim() || undefined,
        employee_count: companyForm.employee_count ? Number(companyForm.employee_count) : undefined,
        founded_year: companyForm.founded_year ? Number(companyForm.founded_year) : undefined,
        company_logo_url: companyForm.company_logo_url?.trim() || undefined,
        company_address:
          includeAddress && companyForm.company_address
            ? {
                country: companyForm.company_address.country,
                state: companyForm.company_address.state,
                city: companyForm.company_address.city,
                address_line: companyForm.company_address.address_line,
                postal_code: companyForm.company_address.postal_code || undefined,
                latitude: companyForm.company_address.latitude,
                longitude: companyForm.company_address.longitude,
              }
            : undefined,
      };

      await employerService.createCompany(payload);
      // Si hay archivo de logo, subirlo inmediatamente tras creación
      try {
        const newCompany = await employerService.getMyCompany();
        if (newCompany && newCompany.company_id && logoFile) {
          await employerService.uploadCompanyLogo(newCompany.company_id, logoFile);
        }
      } catch (_uploadErr) {
        // No bloquear navegación si falla la subida del logo
      }
      setSuccess('Empresa creada exitosamente.');
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear la empresa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Configura tu perfil de Empleador</h1>
          <p>Completa tu información para publicar trabajos y contratar.</p>
          <div className="login-form" style={{ maxWidth: 680 }}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="status ok">{success}</div>}
              {currentStep === 1 && (
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3>Perfil de empleador</h3>
                  <p className="form-hint">Selecciona tu tipo y agrega una breve descripción.</p>
                  <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="employer_type">Tipo de empleador<span className="required-badge">*</span></label>
                    <select id="employer_type" name="employer_type" value={form.employer_type} onChange={handleChange} className="form-input" required aria-describedby="employer-type-hint">
                      <option value="individual">Individual</option>
                      <option value="company">Empresa</option>
                    </select>
                    <small id="employer-type-hint" className="form-hint">Elige "Empresa" si vas a registrar datos corporativos.</small>
                  </div>

                  <div className="form-group col-span-2">
                    <label htmlFor="bio">Descripción (opcional)</label>
                    <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} rows={3} className="form-input" placeholder="Ejemplo: Empresario con 10 años de experiencia en tecnología" aria-describedby="bio-hint" />
                    <small id="bio-hint" className="form-hint">Comparte tu enfoque o áreas en las que contratas.</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="years_as_employer">Años como empleador (opcional)</label>
                    <input id="years_as_employer" name="years_as_employer" type="number" inputMode="numeric" min={0} value={form.years_as_employer} onChange={handleChange} className="form-input" placeholder="5" aria-describedby="years-hint" />
                    <small id="years-hint" className="form-hint">Usa números enteros. Ejemplo: 3.</small>
                  </div>
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Guardando…' : form.employer_type === 'company' ? 'Continuar: Registrar empresa' : 'Guardar perfil de empleador'}</button>
              </form>
            )}

            {currentStep === 2 && (
              <form onSubmit={submitCompany}>
                <h2 style={{ marginTop: 0 }}>Datos de la Empresa</h2>
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group col-span-2">
                    <label htmlFor="company_name">Nombre de la empresa<span className="required-badge">*</span></label>
                    <input id="company_name" name="company_name" type="text" value={companyForm.company_name} onChange={handleCompanyChange} className="form-input" placeholder="TechCorp Solutions C.A." required aria-describedby="company-name-hint" />
                    <small id="company-name-hint" className="form-hint">Usa la razón social completa según tus documentos.</small>
                </div>
              </div>

                <div className="form-group">
                  <label htmlFor="company_rif">RIF</label>
                  <div className="form-row col-span-2" style={{ display: 'flex', gap: 8 }}>
                    <div className="form-group" style={{ width: 120 }}>
                      <select id="rif_prefix" name="rif_prefix" value={rifPrefix} onChange={(e) => setRifPrefix(e.target.value as any)} className="form-input" required aria-describedby="rif-prefix-hint">
                        <option value="J">J (Jurídico)</option>
                        <option value="V">V (Venezolano)</option>
                        <option value="E">E (Extranjero)</option>
                        <option value="G">G (Gobierno)</option>
                        <option value="P">P (Pasaporte)</option>
                        <option value="C">C (Comunidad)</option>
                      </select>
                      <small id="rif-prefix-hint" className="form-hint">Prefijo según el tipo de contribuyente.</small>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <input
                        id="rif_number"
                        name="rif_number"
                        type="text"
                        value={rifNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                          if (digits.length === 8) {
                            const dv = computeRifCheckDigit(rifPrefix, digits);
                            setRifNumber(`${digits}-${dv}`);
                          } else {
                            setRifNumber(digits);
                          }
                          setRifFieldError('');
                        }}
                        onKeyDown={(e) => {
                          const allowedMeta = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                          if (allowedMeta.includes(e.key)) return;
                          // Solo permitir dígitos; bloquear al tener 8 dígitos
                          if (!/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                            return;
                          }
                          const digitsCount = rifNumber.replace(/\D/g, '').length;
                          if (digitsCount >= 8) {
                            e.preventDefault();
                          }
                        }}
                        inputMode="numeric"
                        className="form-input"
                        placeholder="12345678"
                        required
                      />
                      {rifFieldError && <div className="error-message" style={{ marginTop: 6 }}>{rifFieldError}</div>}
                      {rifPreview && !rifFieldError && (
                        <div className="status" style={{ marginTop: 6 }}>RIF esperado: {rifPreview}</div>
                      )}
                      {!rifFieldError && !rifPreview && (
                        <div className="status" style={{ marginTop: 6 }}>Ingresa 8 dígitos; se autocompleta el dígito verificador.</div>
                      )}
                    </div>
                  </div>
                </div>

                </div>

                <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="industry">Industria<span className="required-badge">*</span></label>
                  <select id="industry" name="industry" value={companyForm.industry} onChange={handleCompanyChange} className="form-input" required>
                    {industryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="company_size">Tamaño<span className="required-badge">*</span></label>
                  <select id="company_size" name="company_size" value={companyForm.company_size} onChange={handleCompanyChange} className="form-input" required>
                    {companySizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                </div>

                <div className="form-section">
                  <h3>Contacto</h3>
                  <p className="form-hint">Opcional: canales para que te contacten.</p>
                  <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label htmlFor="company_description">Descripción (opcional)</label>
                    <textarea id="company_description" name="company_description" value={companyForm.company_description || ''} onChange={handleCompanyChange} rows={3} className="form-input" placeholder="Ejemplo: Empresa líder en soluciones tecnológicas innovadoras" />
                  </div>

                  <div className="form-row col-span-2" style={{ display: 'flex', gap: 12 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="company_website">Sitio web (opcional)</label>
                    <input id="company_website" name="company_website" type="url" value={companyForm.company_website || ''} onChange={handleCompanyChange} className="form-input" placeholder="https://www.midominio.com" aria-describedby="website-hint" />
                      <small id="website-hint" className="form-hint">Incluye protocolo https://</small>
                    </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="company_email">Correo (opcional)</label>
                        <input id="company_email" name="company_email" type="email" value={companyForm.company_email || ''} onChange={handleCompanyChange} className="form-input" placeholder="contacto@midominio.com" />
                      </div>
                  </div>

                  <div className="form-row col-span-2" style={{ display: 'flex', gap: 12 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="company_phone">Teléfono (opcional)</label>
                    <input id="company_phone" name="company_phone" type="text" value={companyForm.company_phone || ''} onChange={handleCompanyChange} className="form-input" placeholder="+58-212-1234567" aria-describedby="phone-hint" />
                      <small id="phone-hint" className="form-hint">Incluye código de país. Ej: +58-212-1234567</small>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="company_logo_url">Logo URL (opcional)</label>
                      <input id="company_logo_url" name="company_logo_url" type="url" value={companyForm.company_logo_url || ''} onChange={handleCompanyChange} className="form-input" placeholder="https://www.midominio.com/logo.png" />
                    </div>
                  </div>
                  <div className="form-row col-span-2" style={{ display: 'flex', gap: 12 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Logo de la empresa (imagen)</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setLogoFile(f);
                          if (f) {
                            const url = URL.createObjectURL(f);
                            setLogoPreview(url);
                          } else {
                            setLogoPreview(null);
                          }
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ width: 140, display: 'flex', alignItems: 'center' }}>
                      {logoPreview && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #ddd' }} />
                          <button
                            type="button"
                            className="btn btn-secondary"
                            title="Quitar logo"
                            aria-label="Quitar logo"
                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
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
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Información adicional</h3>
                  <div className="form-row" style={{ display: 'flex', gap: 12 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="employee_count">Empleados (opcional)</label>
                      <input id="employee_count" name="employee_count" type="number" inputMode="numeric" min={1} value={companyForm.employee_count ?? ''} onChange={handleCompanyChange} className="form-input" placeholder="150" aria-describedby="employees-hint" />
                      <small id="employees-hint" className="form-hint">Número aproximado de empleados actuales.</small>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="founded_year">Año de fundación (opcional)</label>
                      <input id="founded_year" name="founded_year" type="number" inputMode="numeric" min={1800} max={new Date().getFullYear()} value={companyForm.founded_year ?? ''} onChange={handleCompanyChange} className="form-input" placeholder="2010" />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={includeAddress} onChange={handleAddressToggle} /> Añadir dirección de la empresa
                  </label>
                  <small className="form-hint">Opcional. Primero selecciona país y estado para habilitar ciudades.</small>
                </div>

                {includeAddress && companyForm.company_address && (
                  <div className="card" style={{ padding: 12, border: '1px solid #ddd', borderRadius: 6, marginTop: 8 }}>
                    <h3 style={{ marginTop: 0 }}>Dirección</h3>
                    <div className="form-row" style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="country">País</label>
                        <select id="country" name="country" value={companyForm.company_address.country} onChange={handleAddressChange} className="form-input" required>
                          <option value="" disabled>Seleccione un país</option>
                          {countryOptions.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="state">Estado/Provincia</label>
                        <select id="state" name="state" value={companyForm.company_address.state} onChange={handleAddressChange} className="form-input" required>
                          <option value="" disabled>Seleccione un estado</option>
                          {(statesByCountry[companyForm.company_address.country] || []).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="city">Ciudad</label>
                        <select id="city" name="city" value={companyForm.company_address.city} onChange={handleAddressChange} className="form-input" required>
                          <option value="" disabled>Seleccione una ciudad</option>
                          {(citiesByState[companyForm.company_address.state] || []).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="postal_code">Código postal (opcional)</label>
                        <input id="postal_code" name="postal_code" type="text" value={companyForm.company_address.postal_code || ''} onChange={handleAddressChange} className="form-input" placeholder="1060" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="address_line">Dirección</label>
                      <input id="address_line" name="address_line" type="text" value={companyForm.company_address.address_line} onChange={handleAddressChange} className="form-input" placeholder="Av. Francisco de Miranda, Torre Parque Cristal" required />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="submit-button" onClick={() => setCurrentStep(1)} disabled={loading}>
                    Volver
                  </button>
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Guardando…' : 'Guardar empresa'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </header>
      <ProfileAssistant 
        currentProfile={currentStep === 1 ? form : companyForm}
        onSuggestion={handleSuggestion}
      />
    </div>
  );
};

export default EmployerOnboardingPage;
