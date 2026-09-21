import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import workerService from '../services/workerService';

const WorkerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState<{
    bio: string;
    years_of_experience: number | '';
    availability_status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
    rate_type: 'hourly' | 'fixed';
    rate_amount: number | '';
    rate_currency: 'USD' | 'EUR' | 'VES';
    base_location_address: string;
    identity_document_type_enum: 'V' | 'E' | 'P' | 'G';
    identity_document_number: string;
    cv_url?: string;
  }>({
    bio: '',
    years_of_experience: '',
    availability_status: 'AVAILABLE',
    rate_type: 'hourly',
    rate_amount: '',
    rate_currency: 'USD',
    base_location_address: '',
    identity_document_type_enum: 'V',
    identity_document_number: '',
    cv_url: undefined,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name.includes('years') || name.includes('amount') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let cvUrl = form.cv_url;
      if (cvFile) {
        const res = await workerService.uploadCv(cvFile);
        cvUrl = res.url;
      }
      await workerService.createProfile({
        bio: form.bio.trim(),
        years_of_experience: Number(form.years_of_experience),
        availability_status: form.availability_status,
        rate_type: form.rate_type,
        rate_amount: Number(form.rate_amount),
        rate_currency: form.rate_currency,
        base_location_address: form.base_location_address?.trim() || undefined,
        identity_document_type_enum: form.identity_document_type_enum,
        identity_document_number: form.identity_document_number.trim(),
        cv_url: cvUrl,
      });
      setSuccess('Perfil de trabajador creado exitosamente.');
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo crear el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Configura tu perfil de Trabajador</h1>
          <p>Completa tu información para empezar a postular y trabajar.</p>
          <div className="login-form" style={{ maxWidth: 680 }}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="status ok">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Información profesional</h3>
                <p className="form-hint">Cuéntanos sobre tu experiencia y disponibilidad.</p>
                <div className="form-group col-span-2">
                  <label htmlFor="bio">Descripción profesional<span className="required-badge">*</span></label>
                  <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} rows={3} className="form-input" placeholder="Breve resumen de tu experiencia" required aria-describedby="bio-hint" />
                  <small id="bio-hint" className="form-hint">Ejemplo: Desarrollador con 4 años en frontend y React.</small>
                </div>

                <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="years_of_experience">Años de experiencia<span className="required-badge">*</span></label>
                <input id="years_of_experience" name="years_of_experience" type="number" inputMode="numeric" min={0} value={form.years_of_experience} onChange={handleChange} className="form-input" placeholder="5" required aria-describedby="years-hint" />
                  <small id="years-hint" className="form-hint">Usa números enteros. Ejemplo: 5.</small>
                </div>

                <div className="form-group">
                  <label htmlFor="availability_status">Disponibilidad<span className="required-badge">*</span></label>
                  <select id="availability_status" name="availability_status" value={form.availability_status} onChange={handleChange} className="form-input" required aria-describedby="availability-hint">
                    <option value="AVAILABLE">Disponible</option>
                    <option value="BUSY">Ocupado</option>
                    <option value="UNAVAILABLE">No disponible</option>
                  </select>
                  <small id="availability-hint" className="form-hint">Indica si puedes aceptar nuevos proyectos.</small>
                </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Tarifas</h3>
                <p className="form-hint">Define cómo cobras y el monto base.</p>
                <div className="form-grid">
                  <div className="form-group">
                  <label htmlFor="rate_type">Tipo de tarifa<span className="required-badge">*</span></label>
                  <select id="rate_type" name="rate_type" value={form.rate_type} onChange={handleChange} className="form-input" required>
                    <option value="hourly">Por hora</option>
                    <option value="fixed">Fija</option>
                  </select>
                  </div>
                  <div className="form-row col-span-2">
                  <div className="form-group">
                    <label htmlFor="rate_amount">Monto de la tarifa<span className="required-badge">*</span></label>
                <input id="rate_amount" name="rate_amount" type="number" inputMode="numeric" min={0} step={0.01} value={form.rate_amount} onChange={handleChange} className="form-input" placeholder="Ej. 15" required aria-describedby="rate-amount-hint" />
                    <small id="rate-amount-hint" className="form-hint">Ingresa un número mayor o igual a 0.</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="rate_currency">Moneda<span className="required-badge">*</span></label>
                    <select id="rate_currency" name="rate_currency" value={form.rate_currency} onChange={handleChange} className="form-input" required>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="VES">VES</option>
                    </select>
                  </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Ubicación</h3>
                <div className="form-grid">
                  <div className="form-group col-span-2">
                  <label htmlFor="base_location_address">Dirección base (opcional)</label>
                  <input id="base_location_address" name="base_location_address" type="text" value={form.base_location_address} onChange={handleChange} className="form-input" placeholder="Ciudad, estado, país" aria-describedby="location-hint" />
                  <small id="location-hint" className="form-hint">Ejemplo: Caracas, Distrito Capital, Venezuela.</small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Documento de identidad</h3>
                <div className="form-grid">
                  <div className="form-row col-span-2">
                  <div className="form-group">
                    <label htmlFor="identity_document_type_enum">Tipo de documento<span className="required-badge">*</span></label>
                    <select id="identity_document_type_enum" name="identity_document_type_enum" value={form.identity_document_type_enum} onChange={handleChange} className="form-input" required aria-describedby="id-type-hint">
                      <option value="V">V (Venezolano)</option>
                      <option value="E">E (Extranjero)</option>
                      <option value="P">P (Pasaporte)</option>
                      <option value="G">G (Jurídico/Gobierno)</option>
                    </select>
                    <small id="id-type-hint" className="form-hint">Selecciona el prefijo que corresponde a tu documento.</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="identity_document_number">Número de documento<span className="required-badge">*</span></label>
                    <input id="identity_document_number" name="identity_document_number" type="text" value={form.identity_document_number} onChange={handleChange} className="form-input" required pattern="^[0-9]{6,10}$" placeholder="Solo números, 6 a 10 dígitos" aria-describedby="id-number-hint" />
                    <small id="id-number-hint" className="form-hint">Evita puntos o guiones. Solo dígitos.</small>
                  </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Currículum (opcional)</h3>
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label htmlFor="cv_file">Subir CV (PDF, DOC, DOCX)</label>
                    <input id="cv_file" name="cv_file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setCvFile(f);
                    }} className="form-input" aria-describedby="cv-hint" />
                    <small id="cv-hint" className="form-hint">Tamaño máximo 5MB. Se adjunta a tu perfil.</small>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Guardando…' : 'Guardar perfil de trabajador'}</button>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
};

export default WorkerOnboardingPage;