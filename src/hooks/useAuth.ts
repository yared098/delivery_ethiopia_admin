import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import type { LoginResponse } from '@/types';

// ══════════════════════════════════════════════════
// SUPER ADMIN (phone + OTP)
// ══════════════════════════════════════════════════

export function useRequestSuperAdminOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      api.post('/auth/super-admin/otp/request', { phone }).then((r) => r.data),
  });
}

export function useVerifySuperAdminOtp() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (d: { phone: string; code: string }) =>
      api.post<LoginResponse>('/auth/super-admin/otp/verify', d).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.account, data.accountType, data.accessToken, data.refreshToken);
    },
  });
}

// ══════════════════════════════════════════════════
// STAFF (phone + password → OTP)
// ══════════════════════════════════════════════════

export function useStaffLogin() {
  return useMutation({
    mutationFn: (d: { phone: string; password: string }) =>
      api.post('/auth/staff/login', d).then((r) => r.data),
  });
}

export function useStaffLoginVerify() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (d: { tempToken: string; code: string }) =>
      api.post<LoginResponse>('/auth/staff/login/verify', d).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.account, data.accountType, data.accessToken, data.refreshToken);
    },
  });
}

// ══════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════

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
