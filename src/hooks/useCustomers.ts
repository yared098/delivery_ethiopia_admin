import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { Customer, PaginatedResponse } from '@/types';

const KEY = ['customers'];

interface ListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function useCustomers(params: ListParams = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Customer>>('/admin/customers', { params });
      return res.data;
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await api.get<Customer>(`/admin/customers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useLookupCustomer(phone: string | null) {
  return useQuery({
    queryKey: ['customer-lookup', phone],
    queryFn: async () => {
      const res = await api.get<Customer | null>('/admin/customers/lookup', {
        params: { phone },
      });
      return res.data;
    },
    enabled: !!phone && phone.length >= 9,
    retry: false,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      phone: string;
      name: string;
      email?: string;
      defaultAddress?: string;
      defaultLat?: number;
      defaultLng?: number;
    }) => {
      const res = await api.post<Customer>('/admin/customers', data);
      return res.data;
    },
    onSuccess: (c) => {
      toast.success(`Customer "${c.name}" created`);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch<Customer>(`/admin/customers/${id}`, data);
      return res.data;
    },
    onSuccess: (c) => {
      toast.success(`Customer "${c.name}" updated`);
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['customer', c.id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSuspendCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/customers/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Customer suspended');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useReactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/customers/${id}/reactivate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Customer reactivated');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/customers/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}
