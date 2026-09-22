import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { Courier, CourierStatus, PaginatedResponse, VehicleType } from '@/types';

interface ListCouriersParams {
  status?: CourierStatus;
  vehicleType?: VehicleType;
  regionId?: string;
  branchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useCouriers(params: ListCouriersParams = {}) {
  return useQuery({
    queryKey: ['couriers', params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Courier>>('/admin/couriers', { params });
      return res.data;
    },
  });
}

export function useCourier(id: string | null) {
  return useQuery({
    queryKey: ['courier', id],
    queryFn: async () => {
      const res = await api.get<Courier>(`/admin/couriers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

interface CreateCourierPayload {
  phone: string;
  name: string;
  email?: string;
  regionId: string;
  branchId: string;
  vehicleType: VehicleType;
  vehiclePlate?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleYear?: number;
  licenseNumber?: string;
  maxWeightKg?: number;
  maxVolumeL?: number;
  handlesFragile?: boolean;
  handlesRefrigerated?: boolean;
  nationalIdNumber?: string;
  nationalIdImageUrl?: string;
  licenseImageUrl?: string;
  vehicleImageUrl?: string;
  selfieUrl?: string;
  password?: string;
}

export function useCreateCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCourierPayload) => {
      const res = await api.post<Courier>('/admin/couriers', data);
      return res.data;
    },
    onSuccess: (c) => {
      toast.success(`Courier "${c.name}" registered (pending approval)`);
      qc.invalidateQueries({ queryKey: ['couriers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUpdateCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCourierPayload> }) => {
      const res = await api.patch<Courier>(`/admin/couriers/${id}`, data);
      return res.data;
    },
    onSuccess: (c) => {
      toast.success(`Courier "${c.name}" updated`);
      qc.invalidateQueries({ queryKey: ['couriers'] });
      qc.invalidateQueries({ queryKey: ['courier', c.id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useApproveCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/couriers/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Courier approved');
      qc.invalidateQueries({ queryKey: ['couriers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useRejectCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/admin/couriers/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Courier rejected');
      qc.invalidateQueries({ queryKey: ['couriers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useSuspendCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/couriers/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Courier suspended');
      qc.invalidateQueries({ queryKey: ['couriers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useReactivateCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/couriers/${id}/reactivate`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Courier reactivated');
      qc.invalidateQueries({ queryKey: ['couriers'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// File upload helper
export function useUploadCourierFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/uploads/courier', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
  });
}

// ══════════════════════════════════════════════════
// DETAIL (with stats) — for courier detail page
// ══════════════════════════════════════════════════
export function useCourierDetail(id: string | null) {
  return useQuery({
    queryKey: ['courier', id, 'detail'],
    queryFn: async () => {
      const res = await api.get(`/admin/couriers/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
