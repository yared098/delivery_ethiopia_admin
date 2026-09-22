import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import type { LoginResponse } from '@/types';

export function useRequestStaffOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const res = await api.post('/auth/staff/otp/request', { phone });
      return res.data;
    },
  });
}

export function useVerifyStaffOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const res = await api.post<LoginResponse>('/auth/staff/otp/verify', {
        phone,
        code,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.account, data.accountType, data.accessToken, data.refreshToken);
    },
  });
}

export function useStaffPasswordLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async ({ phone, password }: { phone: string; password: string }) => {
      const res = await api.post<LoginResponse>('/auth/staff/password/login', {
        phone,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.account, data.accountType, data.accessToken, data.refreshToken);
    },
  });
}

export function useLogout() {
  const { refreshToken } = useAuthStore();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  return async () => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // best-effort
    } finally {
      clearAuth();
      navigate('/login');
    }
  };
}
