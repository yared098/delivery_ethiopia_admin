import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  SendNotificationForm,
  type NotificationFormMode,
} from './SendNotificationForm';
import type { AccountType } from '@/hooks/useNotifications';

type Props = {
  accountType: AccountType;
  accountId: string;
  defaultTitle?: string;
  defaultBody?: string;
  mode?: NotificationFormMode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
};

export function NotifyButton({
  accountType,
  accountId,
  defaultTitle = '',
  defaultBody = '',
  mode = 'single',
  label = '🔔 Notify',
  variant = 'secondary',
  size = 'sm',
}: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleClose = () => {
    setOpen(false);
    setFeedback(null);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Send Push Notification"
      >
        {feedback && (
          <div
            className={`mb-4 p-3 rounded ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? '✅' : '⚠️'} {feedback.message}
          </div>
        )}

        <SendNotificationForm
          compact
          mode={mode}
          defaultAccountType={accountType}
          defaultAccountId={accountId}
          defaultTitle={defaultTitle}
          defaultBody={defaultBody}
          onSent={(msg) => setFeedback({ type: 'success', message: msg })}
          onError={(msg) => setFeedback({ type: 'error', message: msg })}
        />
      </Modal>
    </>
  );
}