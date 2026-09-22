import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { PaginatedResponse, Staff, StaffRole } from '@/types';

interface ListStaffParams {
  role?: StaffRole;
  regionId?: string;
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useStaff(params: ListStaffParams = {}) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Staff>>('/admin/staff', { params });
      return res.data;
    },
  });
}

interface CreateStaffPayload {
  phone: string;
  name: string;
  email?: string;
  regionId?: string;
  branchId?: string;
  password?: string;
  mustChangePassword?: boolean;
}

export function useCreateRegionalAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<CreateStaffPayload, 'branchId'>) => {
      const res = await api.post<Staff>('/admin/staff/regional-admin', data);
      return res.data;
    },
    onSuccess: (s) => {
      toast.success(`Regional Admin "${s.name}" created`);
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useCreateBranchManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStaffPayload) => {
      const res = await api.post<Staff>('/admin/staff/branch-manager', data);
      return res.data;
    },
    onSuccess: (s) => {
      toast.success(`Branch Manager "${s.name}" created`);
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSuspendStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/staff/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Staff suspended — sessions revoked');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useReactivateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/staff/${id}/reactivate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Staff reactivated');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useResetStaffPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await api.post(`/admin/staff/${id}/reset-password`, { password });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset — user must re-login');
      qc.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
