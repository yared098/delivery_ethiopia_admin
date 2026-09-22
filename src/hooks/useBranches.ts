import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { Branch } from '@/types';

interface ListParams {
  regionId?: string;
}

export function useBranches(params: ListParams = {}) {
  return useQuery({
    queryKey: ['branches', params],
    queryFn: async () => {
      const res = await api.get<Branch[]>('/admin/branches', { params });
      return res.data;
    },
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      regionId: string;
      name: string;
      code: string;
      city?: string;
      woreda?: string;
      address?: string;
      phone?: string;
      lat?: number;
      lng?: number;
    }) => {
      const res = await api.post<Branch>('/admin/branches', data);
      return res.data;
    },
    onSuccess: (b) => {
      toast.success(`Branch "${b.name}" created`);
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
      const res = await api.patch<Branch>(`/admin/branches/${id}`, data);
      return res.data;
    },
    onSuccess: (b) => {
      toast.success(`Branch "${b.name}" updated`);
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/branches/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Branch deleted');
      qc.invalidateQueries({ queryKey: ['branches'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
