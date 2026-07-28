import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { changePassword } from '../../../services/auth';
import { getErrorMessage } from '../../../types/api';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      changePassword(payload.currentPassword, payload.newPassword),
    onSuccess: (data: Record<string, unknown>) => {
      const dataObj = (data?.data && typeof data.data === 'object') ? (data.data as Record<string, unknown>) : data;
      const newAccessToken = typeof dataObj?.accessToken === 'string' ? dataObj.accessToken : undefined;
      const newRefreshToken = typeof dataObj?.refreshToken === 'string' ? dataObj.refreshToken : undefined;
      if (newAccessToken) {
        localStorage.setItem('token', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    },
    onError: (err: unknown) => {
      console.error('Failed to change password:', err);
      const msg = getErrorMessage(err, 'Failed to change password');
      toast.error(msg);
    },
  });
};
