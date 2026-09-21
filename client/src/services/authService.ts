import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

// Helper: mapear usuario del backend al tipo del cliente
const mapUserFromBackend = (backendUser: any): User => {
  const rawRole = backendUser?.user_type ?? 'pending';
  const roleLower = typeof rawRole === 'string' ? rawRole.toLowerCase() : 'pending';
  const roleMapped: User['role'] =
    roleLower === 'worker' || roleLower === 'employer' || roleLower === 'admin'
      ? (roleLower as User['role'])
      : 'pending';

  return {
    id: backendUser?._id ?? backendUser?.id ?? '',
    email: backendUser?.email ?? '',
    firstName: backendUser?.first_name ?? backendUser?.firstName ?? '',
    lastName: backendUser?.last_name ?? backendUser?.lastName ?? '',
    phone: backendUser?.phone ?? backendUser?.phone_number ?? '',
    role: roleMapped,
    isVerified: Boolean(backendUser?.email_verified),
    createdAt: backendUser?.createdAt ?? '',
    updatedAt: backendUser?.updatedAt ?? '',
  };
};

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    return {
      user: mapUserFromBackend(data.user),
      token: data.accessToken,
    };
  },

  // Registrar usuario
  register: async (userData: RegisterRequest): Promise<{ message: string; email: string }> => {
    // Convertir datos del cliente al formato del backend
    const backendPayload = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
    };

    const response = await api.post('/auth/signup', backendPayload);
    
    // Retornar información para redirigir a OTP
    return {
      message: response.data.message,
      email: userData.email,
    };
  },

  // Verificar código OTP
  verifyOtp: async (email: string, code: number): Promise<{ isValid: boolean }> => {
    const response = await api.post('/auth/validate-otp', { email, code });
    return response.data;
  },

  // Reenviar código OTP
  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Solicitar recuperación de contraseña (si el correo existe, se envía email)
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Restablecer contraseña usando token del email
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  // Obtener perfil del usuario actual
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/me');
    const data = response.data;
    return mapUserFromBackend(data.user ?? data);
  },

  // Seleccionar rol del usuario autenticado
  selectRole: async (role: 'worker' | 'employer'): Promise<{ message: string }> => {
    const payload = { user_type: role };
    const response = await api.post('/user/select-role', payload);
    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Obtener token del localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Guardar token en localStorage
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
};

export default authService;
