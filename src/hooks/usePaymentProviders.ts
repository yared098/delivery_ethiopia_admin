import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { PaymentProvider, PaymentProviderType } from '@/types';

const KEY = ['payment-providers'];

interface ListParams {
  type?: PaymentProviderType;
  isEnabled?: boolean;
  search?: string;
}

export function usePaymentProviders(params: ListParams = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: async () => {
      const res = await api.get<PaymentProvider[]>('/admin/payment-providers', { params });
      return res.data;
    },
  });
}

export function useEnabledProviders() {
  return useQuery({
    queryKey: [...KEY, 'enabled'],
    queryFn: async () => {
      const res = await api.get<PaymentProvider[]>('/admin/payment-providers/enabled');
      return res.data;
    },
  });
}

interface CreateProviderPayload {
  code: string;
  name: string;
  description?: string;
  type: PaymentProviderType;
  logoUrl?: string;
  color?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  isTestMode?: boolean;
  feePercent?: number;
  feeFixed?: number;
  minAmount?: number;
  maxAmount?: number;
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  configJson?: any;
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProviderPayload) => {
      const res = await api.post<PaymentProvider>('/admin/payment-providers', data);
      return res.data;
    },
    onSuccess: (p) => {
      toast.success(`Provider "${p.name}" added`);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProviderPayload> }) => {
      const res = await api.patch<PaymentProvider>(`/admin/payment-providers/${id}`, data);
      return res.data;
    },
    onSuccess: (p) => {
      toast.success(`Provider "${p.name}" updated`);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useToggleProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/payment-providers/${id}/toggle`);
      return res.data;
    },
    onSuccess: (res: any) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useDeleteProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/payment-providers/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success('Provider deleted');
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUploadProviderLogo() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/uploads/provider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
}
