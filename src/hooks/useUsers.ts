import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { PaginatedResponse, User, Role } from '@/types';

interface ListUsersParams {
  role?: Role;
  regionId?: string;
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<User>>('/admin/users', { params });
      return res.data;
    },
  });
}

interface CreateStaffPayload {
  phone: string;
  name: string;
  email?: string;
  regionId: string;
  branchId?: string;
  password?: string;
  mustChangePassword?: boolean;
}

export function useCreateRegionalAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateStaffPayload, 'branchId'>) => {
      const res = await api.post<User>('/admin/users/regional-admin', data);
      return res.data;
    },
    onSuccess: (u) => {
      toast.success(`Regional Admin "${u.name}" created`);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useCreateBranchManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStaffPayload) => {
      const res = await api.post<User>('/admin/users/branch-manager', data);
      return res.data;
    },
    onSuccess: (u) => {
      toast.success(`Branch Manager "${u.name}" created`);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useCreateCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStaffPayload) => {
      const res = await api.post<User>('/admin/users/courier', data);
      return res.data;
    },
    onSuccess: (u) => {
      toast.success(`Courier "${u.name}" created`);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSuspendUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/users/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User suspended — all sessions revoked');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/users/${id}/reactivate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User reactivated');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      password,
      mustChangePassword,
    }: {
      id: string;
      password: string;
      mustChangePassword: boolean;
    }) => {
      const res = await api.post(`/admin/users/${id}/reset-password`, {
        password,
        mustChangePassword,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset — user must re-login');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
