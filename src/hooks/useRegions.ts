import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { Region } from '@/types';

const KEY = ['regions'];

export function useRegions() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await api.get<Region[]>('/admin/regions');
      return res.data;
    },
  });
}

export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code: string }) => {
      const res = await api.post<Region>('/admin/regions', data);
      return res.data;
    },
    onSuccess: (region) => {
      toast.success(`Region "${region.name}" created`);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; code?: string };
    }) => {
      const res = await api.patch<Region>(`/admin/regions/${id}`, data);
      return res.data;
    },
    onSuccess: (region) => {
      toast.success(`Region "${region.name}" updated`);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/regions/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Region deleted');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
