import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, saveAuthSession, getDecodedToken } from '../services/auth';
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
      const token =
        data?.accessToken ||
        data?.token ||
        data?.data?.accessToken ||
        data?.data?.token;
      const refreshToken = data?.refreshToken || data?.data?.refreshToken;
      const expiresInSeconds =
        data?.expiresInSeconds || data?.data?.expiresInSeconds;

      // Extract user/admin profile info from response or token
      let userObj =
        data?.user ||
        data?.data?.user ||
        data?.admin ||
        data?.data?.admin ||
        data?.account ||
        data?.data?.account;

      if (!userObj && data?.data && typeof data.data === 'object' && (data.data.firstName || data.data.name || data.data.email)) {
        userObj = data.data;
      }
      if (!userObj && data && typeof data === 'object' && (data.firstName || data.name || data.email)) {
        userObj = data;
      }
      if (!userObj && token) {
        const decoded = getDecodedToken(token);
        if (decoded) {
          userObj = decoded;
        }
      }

      if (userObj && typeof userObj === 'object') {
        try {
          localStorage.setItem('admin_user', JSON.stringify(userObj));
        } catch {}
      }

      saveAuthSession(token, refreshToken, expiresInSeconds);

      const result = data?.status ?? 'success';
      if (result === 'locked' || result === 'expired') {
        initializeLogin(result);
      } else {
        initializeLogin('default');
      }

      if (result === 'success' || !data?.status) {
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
