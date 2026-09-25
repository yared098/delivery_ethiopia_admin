import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ══════════════════════════════════════════════════
// Core types
// ══════════════════════════════════════════════════

export type AccountType = 'CUSTOMER' | 'COURIER' | 'STAFF';

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_ASSIGNED'
  | 'ORDER_PICKED_UP'
  | 'ORDER_DELIVERED'
  | 'ORDER_FAILED'
  | 'ORDER_CANCELLED'
  | 'COURIER_APPROVED'
  | 'COURIER_REJECTED'
  | 'PAYOUT_PAID'
  | 'RECEIVER_LINK'
  | 'WELCOME'
  | 'SYSTEM'
  | 'MANUAL';

// ══════════════════════════════════════════════════
// Send / Broadcast (existing)
// ══════════════════════════════════════════════════

export type SendNotificationInput = {
  accountType: AccountType;
  accountId: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
};

export type BroadcastInput = {
  title: string;
  body: string;
  topic: string;
};

export type SendResult = {
  success: boolean;
  sent?: number;
  failed?: number;
  error?: string;
  messageId?: string;
};

export function useSendNotification() {
  return useMutation<SendResult, Error, SendNotificationInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<SendResult>(
        '/notifications/send',
        input,
      );
      return data;
    },
  });
}

export function useBroadcastNotification() {
  return useMutation<SendResult, Error, BroadcastInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<SendResult>(
        '/notifications/broadcast',
        input,
      );
      return data;
    },
  });
}

// ══════════════════════════════════════════════════
// History / Admin list
// ══════════════════════════════════════════════════

export type NotificationRow = {
  id: string;
  type: NotificationType;
  accountType: AccountType;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  pushSent: boolean;
  pushSentAt?: string;
  pushError?: string;
  createdAt: string;
  customer?: { id: string; name: string | null; phone: string };
  courier?: { id: string; name: string; phone: string };
  staff?: { id: string; name: string; phone: string };
  order?: { id: string; trackingNumber: string; status: string };
};

export type NotificationListQuery = {
  accountType?: AccountType;
  type?: NotificationType;
  unread?: boolean;
  search?: string;
  page?: number;
  limit?: number;
};

export type NotificationListResult = {
  data: NotificationRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type NotificationStats = {
  total: number;
  unread: number;
  pushed: number;
  failed: number;
  today: number;
};

export function useAdminNotifications(query: NotificationListQuery = {}) {
  // Strip falsy values so the URL stays clean
  const params: Record<string, any> = {};
  if (query.accountType) params.accountType = query.accountType;
  if (query.type) params.type = query.type;
  if (query.unread === true) params.unread = 'true';
  if (query.search) params.search = query.search;
  params.page = query.page ?? 1;
  params.limit = query.limit ?? 20;

  return useQuery<NotificationListResult>({
    queryKey: ['notifications', 'admin', params],
    queryFn: async () => {
      const { data } = await api.get<NotificationListResult>(
        '/notifications/admin/list',
        { params },
      );
      return data;
    },
    placeholderData: (prev) => prev, // keeps previous page while loading
  });
}

export function useNotificationStats() {
  return useQuery<NotificationStats>({
    queryKey: ['notifications', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<NotificationStats>(
        '/notifications/admin/stats',
      );
      return data;
    },
    refetchInterval: 30_000,
  });
}