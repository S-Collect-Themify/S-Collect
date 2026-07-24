import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../types/api';

export interface LoginFormValues {
  email: string;
  password: string;
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { initializeLogin } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      try {
        const response = await login(data.email, data.password);
        if (response && response.success === false) {
          throw new Error(response.message || 'Login failed');
        }
        return response;
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Login failed'));
      }
    },
    onSuccess: (data) => {
      const token = data?.accessToken || data?.token || data?.data?.accessToken || data?.data?.token;
      const refreshToken = data?.refreshToken || data?.data?.refreshToken;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      const result = data?.status ?? 'success';
      if (result === 'locked' || result === 'expired') {
        initializeLogin(result);
      } else {
        initializeLogin('default');
      }

      if (result === 'change-password') {
        navigate('/forget-pass');
      } else if (result === 'success' || !data?.status) {
        navigate('/');
      }
    },
  });

  return {
    login: loginMutation.mutate,
    isPending: loginMutation.isPending,
    error: loginMutation.error,
    reset: loginMutation.reset,
  };
};
