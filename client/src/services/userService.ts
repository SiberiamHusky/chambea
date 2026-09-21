import api from './api';

export interface DeleteAccountResponse {
  message?: string;
}

const userService = {
  // Eliminar cuenta del usuario autenticado
  deleteMe: async (): Promise<DeleteAccountResponse> => {
    const res = await api.delete('/user/me');
    return res.data ?? { message: 'Cuenta eliminada' };
  },
};

export default userService;