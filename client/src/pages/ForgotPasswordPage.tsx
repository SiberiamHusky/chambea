import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await authService.forgotPassword(email.trim());
      setMessage('Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      // Respuesta genérica para no revelar existencia del email
      setMessage('Si el correo existe, te enviaremos un enlace para restablecer tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header" style={{ textAlign: 'center' }}>
            <h1>Recupera tu contraseña</h1>
            <p>Te enviaremos un enlace si el correo está registrado.</p>
          </div>

          <div className="login-form">
            {error && <div className="error-message" role="alert">{error}</div>}
            {message && <div className="success-message" role="status">{message}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  aria-describedby="email-hint"
                  placeholder="nombre@dominio.com"
                />
                <small id="email-hint" className="form-hint">Ej: nombre@dominio.com</small>
              </div>

              <button className="submit-button" type="submit" disabled={loading || !email.trim()}>
                {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                ¿Recordaste tu contraseña? <Link to="/login" className="link-brand">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>

        <aside className="login-page-sidebar">
          <div className="sidebar-content">
            <h2>Consejos de seguridad</h2>
            <p>Usa una contraseña única y difícil de adivinar.</p>
            <ul className="benefits-list">
              <li>• Mínimo 8 caracteres</li>
              <li>• Incluye mayúsculas y minúsculas</li>
              <li>• Agrega dígitos o símbolos</li>
            </ul>

            <p>
              ¿No tienes cuenta? <Link to="/register" className="link-brand">Regístrate</Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}