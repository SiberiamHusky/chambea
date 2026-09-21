import React from 'react';
import Register from '../components/Register';

const RegisterPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header">
            <h1>Crea tu cuenta</h1>
            <p>Regístrate para empezar a encontrar tu próxima chamba</p>
          </div>

          <Register />
        </div>

        <div className="login-page-sidebar">
          <div className="sidebar-content">
            <h2>Ventajas de registrarte</h2>
            <p>
              Publica tu perfil, guarda empleos y recibe alertas de nuevas 
              oportunidades que encajan contigo.
            </p>

            <ul className="benefits-list">
              <li>✓ Perfil profesional y CV visibles</li>
              <li>✓ Alertas y recomendaciones personalizadas</li>
              <li>✓ Seguimiento de postulaciones</li>
              <li>✓ Mensajería con empleadores</li>
            </ul>

            {/* Enlace a iniciar sesión removido del bloque de ventajas */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;