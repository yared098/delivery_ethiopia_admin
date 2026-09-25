import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AccountType = 'CUSTOMER' | 'COURIER' | 'STAFF';

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
      const { data } = await api.post<SendResult>('/notifications/send', input);
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