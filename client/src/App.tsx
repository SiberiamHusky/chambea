import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import './App.css';
import globeIconUrl from './assets/globe-icon.svg';
import userIconUrl from './assets/user-icon.svg';
import Logo from './components/Logo';
import RegisterPage from './pages/RegisterPage';
import OTPVerification from './components/OTPVerification';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
const WorkerOnboardingPage = React.lazy(() => import('./pages/WorkerOnboardingPage'));
const EmployerOnboardingPage = React.lazy(() => import('./pages/EmployerOnboardingPage'));
import JobDetailPage from './pages/JobDetailPage';
import JobCreatePage from './pages/JobCreatePage';
import WorkerApplicationsPage from './pages/WorkerApplicationsPage';
import EmployerJobApplicationsPage from './pages/EmployerJobApplicationsPage';
import EmployerJobsPage from './pages/EmployerJobsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import JobEditPage from './pages/JobEditPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChatPage from './pages/ChatPage';
import InterviewMessagePage from './pages/InterviewMessagePage';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Guard de rol específico: restringe acceso a rutas según el rol del usuario
const RequireRole: React.FC<{ role: 'worker' | 'employer' | 'admin'; children: React.ReactNode }> = ({ role, children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }
  if (!user || user.role !== role) {
    return <Navigate to="/select-role" replace />;
  }
  return <>{children}</>;
};

// Guard global: si el usuario autenticado no tiene rol aún, redirige a /select-role
const RoleGuard: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  const needsRole = isAuthenticated && user?.role === 'pending';
  const isOnRolePage = location.pathname === '/select-role';
  if (needsRole && !isOnRolePage) {
    return <Navigate to="/select-role" replace />;
  }
  return null;
};

// Componente para rutas públicas (redirige si ya está autenticado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Guard: permite acceder a creación de empleo solo si se navega desde botón autorizado
const RequireCreateAccess: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const fromButton = (location.state as any)?.fromCreateButton === true;
  return fromButton ? <>{children}</> : <Navigate to="/employer/jobs" replace />;
};

// Componente de navegación
const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const onRolePage = location.pathname === '/select-role';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <nav className="navbar">
      <div className="nav-container">
        {onRolePage ? (
          <a className="nav-brand nav-brand-disabled" aria-disabled="true">
            <Logo size={28} colorMark="#0b3b2a" colorText="#0f172a" />
          </a>
        ) : (
          <Link to="/" className="nav-brand">
            <Logo size={28} colorMark="#0b3b2a" colorText="#0f172a" />
          </Link>
        )}
        <div className="nav-actions">
          {!isAuthenticated && !onRolePage && (
            <Link to="/login" className="btn btn-primary px-6 py-2 rounded-lg font-semibold">
              Iniciar Sesión
            </Link>
          )}
          {isAuthenticated && !onRolePage && (
            <div className="user-menu" ref={menuRef}>
              <button className="menu-button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(o => !o)}>
                <img src={userIconUrl} alt="Menú de usuario" />
              </button>
              <div className={`menu-dropdown ${open ? 'open' : ''}`} role="menu">
                {!onRolePage && (
                  <Link to="/profile" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>Ver perfil</Link>
                )}
                {/* Chat ahora vive como botón flotante en Home; se retira del menú */}
                {!onRolePage && user?.role === 'worker' && (
                  <Link to="/applications" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>Mis postulaciones</Link>
                )}
                {!onRolePage && user?.role === 'employer' && (
                  <>
                    <Link to="/employer/jobs" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>Mis empleos</Link>
                  </>
                )}
                {!onRolePage && user?.role === 'admin' && (
                  <Link to="/admin" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>Panel admin</Link>
                )}
                {!onRolePage && <div className="menu-divider" />}
                <button className="menu-item" role="menuitem" onClick={() => { setOpen(false); logout(); }}>Cerrar Sesión</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  return (
    <div className="app">
      <Navigation />
      
      <main className="main-content">
        {/* Si el usuario autenticado no ha elegido rol, forzamos selección */}
        <RoleGuard />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<Navigate to="/" replace />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interviews/:userId" 
            element={
              <ProtectedRoute>
                <InterviewMessagePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <RequireRole role="admin">
                  <AdminDashboardPage />
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id/edit" 
            element={
              <ProtectedRoute>
                <RequireRole role="employer">
                  <JobEditPage />
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id/applications" 
            element={
              <ProtectedRoute>
                <RequireRole role="employer">
                  <EmployerJobApplicationsPage />
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/new" 
            element={
              <ProtectedRoute>
                <RequireRole role="employer">
                  <RequireCreateAccess>
                    <JobCreatePage />
                  </RequireCreateAccess>
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applications" 
            element={
              <ProtectedRoute>
                <RequireRole role="worker">
                  <WorkerApplicationsPage />
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/verify-otp" 
            element={
              <PublicRoute>
                <OTPVerification />
              </PublicRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/select-role" 
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding/worker" 
            element={
              <ProtectedRoute>
                <RequireRole role="worker">
                  <React.Suspense fallback={<div className="loading-screen">Cargando…</div>}>
                    <WorkerOnboardingPage />
                  </React.Suspense>
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/onboarding/employer" 
            element={
              <ProtectedRoute>
                <React.Suspense fallback={<div className="loading-screen">Cargando…</div>}>
                  <EmployerOnboardingPage />
                </React.Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/jobs" 
            element={
              <ProtectedRoute>
                <RequireRole role="employer">
                  <EmployerJobsPage />
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/dashboard" 
            element={<Navigate to="/employer/jobs" replace />} 
          />
          <Route 
            path="/profile/edit" 
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {/* Footer removido para dejar el Home limpio y sin secciones inferiores */}
    </div>
  );
};

// Componente raíz con proveedores
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
