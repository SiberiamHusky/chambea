import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import type { RegisterRequest } from '../types';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState({
    length: false,
    lower: false,
    upper: false,
    numberOrSymbol: false,
  });
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const pw = value;
      const hasNumber = /\d/.test(pw);
      const hasSymbol = /[^\w\s]/.test(pw);
      const nextCriteria = {
        length: pw.length >= 8,
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        numberOrSymbol: hasNumber || hasSymbol,
      };
      setCriteria(nextCriteria);
      const score = Object.values(nextCriteria).filter(Boolean).length;
      setStrength(score);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones del cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLoading(false);
      return setError('Por favor ingresa un email válido');
    }

    if (!criteria.length || !criteria.upper || !criteria.lower || !criteria.numberOrSymbol) {
      setLoading(false);
      return setError('La contraseña debe cumplir todos los criterios');
    }

    if (formData.password !== confirmPassword) {
      setLoading(false);
      return setError('Las contraseñas no coinciden');
    }

    // Validación del teléfono
    const phoneRegex = /^\+58(424|426|412|414|416)\d{7}$/;
    if (!phoneRegex.test(formData.phone)) {
      setLoading(false);
      return setError('El teléfono debe tener formato +58424XXXXXXX (424/426/412/414/416)');
    }

    try {
      const result = await authService.register(formData);
      
      // Redirigir a verificación OTP con email y contraseña
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          password: formData.password // Para login automático después de verificar
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Crear Cuenta</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Nombre</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Tu nombre"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Tu apellido"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="tu@email.com"
            />
          </div>
          {/* Teléfono antes que contraseña */}
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="+584241234567"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                className="field-icon"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword(p => !p)}
              >
                👁
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Repite tu contraseña"
            />
          </div>
          {/* Especificaciones de contraseña al final */}
          <div className="password-criteria">
            <div className="strength-bar">
              <div
                className="strength-fill"
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
            <ul className="criteria-list">
              <li className={`criteria-item ${criteria.length ? 'ok' : ''}`}>Mínimo 8 caracteres</li>
              <li className={`criteria-item ${criteria.lower ? 'ok' : ''}`}>Una letra minúscula</li>
              <li className={`criteria-item ${criteria.upper ? 'ok' : ''}`}>Una letra mayúscula</li>
              <li className={`criteria-item ${criteria.numberOrSymbol ? 'ok' : ''}`}>Un dígito o símbolo</li>
            </ul>
          </div>
          

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creando cuenta…' : 'Registrarse'}
          </button>
          <p style={{ marginTop: 10, fontSize: '0.85rem', color: '#475569' }}>
            Al registrarte, aceptas nuestros <Link className="link-brand" to="/terms">Términos</Link> y la <Link className="link-brand" to="/privacy">Política de Privacidad</Link>.
          </p>
        </form>

        <div className="login-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login" className="link-brand">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;