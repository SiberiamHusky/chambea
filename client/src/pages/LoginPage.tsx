import React from 'react';
import Login from '../components/Login';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header">
            <h1>Bienvenido a Chambea</h1>
            <p>Inicia sesión para acceder a tu cuenta</p>
          </div>
          
          <Login />
        </div>
        
        <div className="login-page-sidebar">
          <div className="sidebar-content">
            <h2>¿Nuevo en Chambea?</h2>
            <p>
              Únete a miles de profesionales que ya encontraron 
              su trabajo ideal a través de nuestra plataforma.
            </p>
            
            <ul className="benefits-list">
              <li>✓ Acceso a empleos exclusivos</li>
              <li>✓ Perfil profesional personalizado</li>
              <li>✓ Notificaciones de nuevas oportunidades</li>
              <li>✓ Seguimiento de aplicaciones</li>
            </ul>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;