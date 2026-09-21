import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = query.get('token') || '';
    setToken(t);
  }, [query]);

  const isStrongEnough = (pwd: string) => {
    // Coincide con requisitos del backend: 8-64, mayúsculas, minúsculas, dígito o símbolo
    const lengthOk = pwd.length >= 8 && pwd.length <= 64;
    const upper = /[A-Z]/.test(pwd);
    const lower = /[a-z]/.test(pwd);
    const digitOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>\-_=+\[\]{}]/.test(pwd);
    return lengthOk && upper && lower && digitOrSymbol;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!token) {
        throw new Error('Token faltante. Usa el enlace del correo.');
      }
      if (!isStrongEnough(password)) {
        throw new Error('La contraseña no cumple los requisitos de seguridad.');
      }
      await authService.resetPassword(token, password);
      setMessage('Tu contraseña ha sido actualizada.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'No pudimos restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header" style={{ textAlign: 'center' }}>
            <h1>Restablecer tu contraseña</h1>
            <p>Elige una nueva contraseña segura para tu cuenta.</p>
          </div>

          <div className="login-form">
            {error && <div className="error-message" role="alert">{error}</div>}
            {message && <div className="success-message" role="status">{message}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  aria-describedby="password-hint"
                  placeholder="••••••••"
                />
                <small id="password-hint" className="form-hint">
                  Mínimo 8 caracteres, incluir mayúscula, minúscula y dígito o símbolo.
                </small>
              </div>

              <button className="submit-button" type="submit" disabled={loading || !isStrongEnough(password)}>
                {loading ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                ¿Necesitas solicitar el enlace otra vez?{' '}
                <Link to="/forgot-password" className="link-brand">Recuperar contraseña</Link>
              </p>
              <p>
                ¿Ya puedes iniciar sesión?{' '}
                <Link to="/login" className="link-brand">Ir al login</Link>
              </p>
            </div>
          </div>
        </div>

        <aside className="login-page-sidebar">
          <div className="sidebar-content">
            <h2>Recomendaciones de seguridad</h2>
            <p>Mejora la seguridad de tu cuenta con una contraseña fuerte.</p>
            <ul className="benefits-list">
              <li>• No reutilices contraseñas de otros sitios</li>
              <li>• Mezcla letras, números y símbolos</li>
              <li>• Evita información personal obvia</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}