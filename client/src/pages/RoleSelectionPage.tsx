import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleSelectionPage: React.FC = () => {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSelect = async (role: 'worker' | 'employer') => {
    setError('');
    setLoading(role);
    try {
      await selectRole(role);
      navigate(role === 'worker' ? '/onboarding/worker' : '/onboarding/employer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo seleccionar el rol');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Elige tu rol</h1>
          <p>Selecciona cómo quieres usar Chambea.</p>
          <div className="role-grid">
            <div className="role-card">
              <h3 className="role-title">Trabajador</h3>
              <ul className="role-list">
                <li>Crear perfil profesional con experiencia, habilidades, tarifas y disponibilidad.</li>
                <li>Buscar y postular a trabajos publicados por empleadores.</li>
                <li>Gestionar postulaciones, mensajes y estado de tus trabajos.</li>
                <li>Construir reputación con evaluaciones y completar más proyectos.</li>
              </ul>
              <p className="role-meta">Ideal si ofreces servicios y buscas oportunidades.</p>
              <div className="role-actions">
                <button className="btn btn-primary" disabled={!!loading} onClick={() => handleSelect('worker')}>
                  {loading === 'worker' ? 'Guardando…' : 'Soy trabajador'}
                </button>
              </div>
            </div>

            <div className="role-card">
              <h3 className="role-title">Empleador</h3>
              <ul className="role-list">
                <li>Publicar ofertas de trabajo con requisitos, presupuesto y plazos.</li>
                <li>Explorar perfiles, recibir postulaciones y evaluar candidatos.</li>
                <li>Gestionar contrataciones, mensajes y el progreso de tus proyectos.</li>
                <li>Construir marca como empresa o persona que contrata talento.</li>
              </ul>
              <p className="role-meta">Ideal si necesitas contratar profesionales para tus proyectos.</p>
              <div className="role-actions">
                <button className="btn btn-primary" disabled={!!loading} onClick={() => handleSelect('employer')}>
                  {loading === 'employer' ? 'Guardando…' : 'Soy empleador'}
                </button>
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </header>
    </div>
  );
};

export default RoleSelectionPage;