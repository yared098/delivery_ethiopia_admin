import { useEffect, useState } from 'react';
import { Bell, Megaphone, Send, User, Bike, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useSendNotification,
  useBroadcastNotification,
  type AccountType,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export type NotificationFormMode = 'single' | 'broadcast';

type Props = {
  mode?: NotificationFormMode;
  defaultAccountType?: AccountType;
  defaultAccountId?: string;
  defaultTitle?: string;
  defaultBody?: string;
  onSent?: (message: string) => void;
  onError?: (message: string) => void;
  compact?: boolean;
};

const ACCOUNT_OPTIONS: {
  value: AccountType;
  label: string;
  icon: any;
  hint: string;
}[] = [
  { value: 'COURIER', label: 'Courier', icon: Bike, hint: 'Delivery rider' },
  { value: 'CUSTOMER', label: 'Customer', icon: User, hint: 'Sender / receiver' },
  { value: 'STAFF', label: 'Staff', icon: ShieldCheck, hint: 'Admins & managers' },
];

export function SendNotificationForm({
  mode: initialMode = 'single',
  defaultAccountType = 'COURIER',
  defaultAccountId = '',
  defaultTitle = '',
  defaultBody = '',
  onSent,
  onError,
  compact = false,
}: Props) {
  const [mode, setMode] = useState<NotificationFormMode>(initialMode);

  const [accountType, setAccountType] = useState<AccountType>(defaultAccountType);
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [imageUrl, setImageUrl] = useState('');
  const [topic, setTopic] = useState('couriers');

  useEffect(() => setAccountType(defaultAccountType), [defaultAccountType]);
  useEffect(() => setAccountId(defaultAccountId), [defaultAccountId]);
  useEffect(() => setTitle(defaultTitle), [defaultTitle]);
  useEffect(() => setBody(defaultBody), [defaultBody]);

  const sendSingle = useSendNotification();
  const sendBroadcast = useBroadcastNotification();
  const isSending = sendSingle.isPending || sendBroadcast.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'single') {
        const res = await sendSingle.mutateAsync({
          accountType,
          accountId,
          title,
          body,
          imageUrl: imageUrl || undefined,
        });
        if (res.success) {
          onSent?.(`Sent to ${res.sent ?? 0} device(s), ${res.failed ?? 0} failed.`);
        } else {
          onError?.(res.error ?? 'Send failed');
        }
      } else {
        const res = await sendBroadcast.mutateAsync({ title, body, topic });
        if (res.success) {
          onSent?.(`Broadcast sent to topic "${topic}".`);
        } else {
          onError?.(res.error ?? 'Broadcast failed');
        }
      }
    } catch (err: any) {
      onError?.(err?.response?.data?.message ?? err.message ?? 'Unknown error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Mode Toggle ── */}
      {!compact && (
        <div className="inline-flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
              mode === 'single'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            <Bell className="h-4 w-4" />
            Single Recipient
          </button>
          <button
            type="button"
            onClick={() => setMode('broadcast')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
              mode === 'broadcast'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            <Megaphone className="h-4 w-4" />
            Broadcast
          </button>
        </div>
      )}

      {/* ── Single: Account Type Cards ── */}
      {mode === 'single' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send to
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = accountType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAccountType(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center',
                      active
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        active ? 'text-primary-600' : 'text-gray-500',
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        active ? 'text-primary-700' : 'text-gray-700',
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account ID
            </label>
            <Input
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. clxx123abc..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the {accountType.toLowerCase()} ID from their detail page.
            </p>
          </div>
        </>
      )}

      {/* ── Broadcast: Topic ── */}
      {mode === 'broadcast' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="couriers | customers | branch_<id>"
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['couriers', 'customers', 'staff'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={cn(
                  'text-[11px] px-2 py-1 rounded-full border transition-colors',
                  topic === t
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-gray-100 pt-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Delivery Update"
            required
            maxLength={65}
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">
            {title.length}/65
          </p>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your parcel is on the way."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
            rows={3}
            required
            maxLength={180}
          />
          <p className="text-[11px] text-gray-400 mt-1 text-right">
            {body.length}/180
          </p>
        </div>

        {/* Image URL */}
        {mode === 'single' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSending}
          className="w-full inline-flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : mode === 'single' ? (
            <>
              <Send className="h-4 w-4" />
              Send Notification
            </>
          ) : (
            <>
              <Megaphone className="h-4 w-4" />
              Broadcast to Topic
            </>
          )}
        </Button>
      </div>
    </form>
  );
}