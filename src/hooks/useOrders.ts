import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, apiError } from '@/lib/api';
import type { Order, OrderStatus, PaginatedResponse, PaymentParty, ItemType } from '@/types';

const KEY = ['orders'];

interface ListOrdersParams {
  status?: OrderStatus;
  senderId?: string;
  receiverId?: string;
  courierId?: string;
  originBranchId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ══════════════════════════════════════════════════
// QUERIES
// ══════════════════════════════════════════════════

export function useOrders(params: ListOrdersParams = {}) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Order>>('/admin/orders', { params });
      return res.data;
    },
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get<Order>(`/admin/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

// ══════════════════════════════════════════════════
// CREATE
// ══════════════════════════════════════════════════

interface CreateOrderItem {
  type?: ItemType;
  description: string;
  quantity?: number;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeL?: number;
  declaredValue?: number;
  isFragile?: boolean;
  isRefrigerated?: boolean;
  photoUrl?: string;
}

interface CreateOrderPayload {
  sender: {
    customerId?: string;
    name: string;
    phone: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  receiver: {
    customerId?: string;
    name?: string;
    phone: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  items: CreateOrderItem[];
  originBranchId?: string;
  destBranchId?: string;
  packageDescription?: string;
  paymentParty?: PaymentParty;
  sendReceiverLink?: boolean;
  codAmount?: number;
  notes?: string;
  courierId?: string;
  autoAssignCourier?: boolean;
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderPayload) => {
      const res = await api.post<{
        order: Order;
        receiverLink: any;
        courierAssigned: any;
      }>('/admin/orders', data);
      return res.data;
    },
    onSuccess: (res) => {
      if (res.courierAssigned) {
        toast.success(
          `Order ${res.order.trackingNumber} created · assigned to ${res.courierAssigned.name}`,
        );
      } else {
        toast.success(`Order ${res.order.trackingNumber} created`);
      }
      qc.invalidateQueries({ queryKey: KEY });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch<Order>(`/admin/orders/${id}`, data);
      return res.data;
    },
    onSuccess: (o) => {
      toast.success(`Order ${o.trackingNumber} updated`);
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order', o.id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// COURIER ASSIGNMENT
// ══════════════════════════════════════════════════

export function useAssignCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      courierId,
    }: {
      orderId: string;
      courierId: string;
    }) => {
      const res = await api.post(`/admin/orders/${orderId}/assign-courier`, {
        courierId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Assigned to ${data.courier?.name || 'courier'}`,
      );
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useAutoAssignCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/admin/orders/${orderId}/auto-assign`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Auto-assigned to ${data.courier?.name || 'best available courier'}`,
      );
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

export function useUnassignCourier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/admin/orders/${orderId}/unassign-courier`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Courier unassigned');
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// RECEIVER LINK
// ══════════════════════════════════════════════════

export function useSendReceiverLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/orders/${id}/send-receiver-link`, {
        sendSms: true,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Receiver link sent');
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// CANCEL
// ══════════════════════════════════════════════════

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/orders/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order cancelled');
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// DELETE (hard) — SUPER_ADMIN only
// ══════════════════════════════════════════════════

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/orders/${id}`);
      return res.data;
    },
    onSuccess: (_data, id) => {
      toast.success('Order deleted');
      qc.invalidateQueries({ queryKey: KEY });
      qc.removeQueries({ queryKey: ['order', id] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}

// ══════════════════════════════════════════════════
// LOCATION UPDATE (test / staff fallback)
// ══════════════════════════════════════════════════

export function useUpdateOrderLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      lat,
      lng,
    }: {
      orderId: string;
      lat: number;
      lng: number;
    }) => {
      const res = await api.post(`/admin/orders/${orderId}/location`, {
        lat,
        lng,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (err) => toast.error(apiError(err)),
  });
}