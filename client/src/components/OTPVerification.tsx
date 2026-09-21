import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Obtener email del state de navegación
  const email = location.state?.email;
  const password = location.state?.password;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.verifyOtp(email, parseInt(otpCode));
      
      if (result.isValid) {
        setSuccess('¡Código verificado correctamente!');
        
        // Si tenemos la contraseña, hacer login automático y enviar a selección de rol
        if (password) {
          try {
            await login({ email, password });
          } catch (loginError: any) {
            // Ignorar error de login y dejar que la ruta protegida redirija si no hay sesión
          }
        }
        // Redirigir a selección de rol (si no hay sesión, ProtectedRoute enviará a login)
        navigate('/select-role');
      } else {
        setError('Código incorrecto o expirado. Por favor intenta nuevamente.');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar el código');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.resendOtp(email);
      setSuccess('Código reenviado correctamente. Revisa tu correo.');
      setResendCooldown(60); // 60 segundos de cooldown
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header">
            <h1>Verificar tu cuenta</h1>
            <p>Hemos enviado un código de 6 dígitos a</p>
            <p style={{ color: 'var(--brand)', fontWeight: 700 }}>{email}</p>
          </div>

          <div className="login-form">
            <h2>Verificación OTP</h2>

            {error && (
              <div className="error-message">{error}</div>
            )}

            {success && (
              <div className="success-message">{success}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="otp">Código de verificación</label>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input"
                      disabled={loading}
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="submit-button"
              >
                {loading ? 'Verificando...' : 'Verificar código'}
              </button>

              <div className="otp-actions" style={{ marginTop: 12 }}>
                <p style={{ color: '#334155' }}>
                  ¿No recibiste el código?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading || resendCooldown > 0}
                    className="link-button"
                  >
                    {resendLoading
                      ? 'Reenviando...'
                      : resendCooldown > 0
                        ? `Reenviar en ${resendCooldown}s`
                        : 'Reenviar código'}
                  </button>
                </p>

                <Link to="/register" className="link-brand">← Volver al registro</Link>
              </div>
            </form>
          </div>
        </div>

        <div className="login-page-sidebar">
          <div className="sidebar-content">
            <h2>¿Problemas con el código?</h2>
            <p>
              Asegúrate de revisar tu bandeja de entrada y la carpeta de spam.
            </p>
            <ul className="benefits-list">
              <li>✓ El código expira en 15 minutos</li>
              <li>✓ Puedes reenviar uno nuevo si lo necesitas</li>
              <li>✓ Verifica para acceder a todas las funciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;