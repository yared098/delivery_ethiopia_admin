import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  List,
  Send,
  TrendingUp,
  AlertTriangle,
  X,
  ChevronRight,
  Package,
  Bike,
  Wallet,
  UserPlus,
  Settings,
  Clock,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/layout/PageHeader';
import { SendNotificationForm } from '@/components/notifications/SendNotificationForm';
import {
  useAdminNotifications,
  useNotificationStats,
  type NotificationRow,
  type NotificationType,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

type RightTab = 'history' | 'preview' | 'tips';

export function Notifications() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('history');

  const clear = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Push Notifications"
        subtitle="Send manual FCM notifications and monitor delivery history."
      />

      <StatsRow />

      {/* Feedback banners */}
      <div className="space-y-2 mb-6">
        {success && (
          <Banner
            type="success"
            icon={CheckCircle2}
            message={success}
            onClose={clear}
          />
        )}
        {error && (
          <Banner
            type="error"
            icon={AlertCircle}
            message={error}
            onClose={clear}
          />
        )}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT — Compose form (3/5) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-transparent">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-primary-700" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Compose Notification
                  </h2>
                  <p className="text-xs text-gray-500">
                    Fill the details and hit send
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <SendNotificationForm
                onSent={(msg) => {
                  clear();
                  setSuccess(msg);
                  setRightTab('history');
                }}
                onError={(msg) => {
                  clear();
                  setError(msg);
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Tabbed sidebar (2/5) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-260px)]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/40">
              <RightTabButton
                active={rightTab === 'history'}
                onClick={() => setRightTab('history')}
                icon={List}
                label="History"
              />
              <RightTabButton
                active={rightTab === 'preview'}
                onClick={() => setRightTab('preview')}
                icon={Smartphone}
                label="Preview"
              />
              <RightTabButton
                active={rightTab === 'tips'}
                onClick={() => setRightTab('tips')}
                icon={Sparkles}
                label="Tips"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {rightTab === 'history' && <HistoryPanel />}
              {rightTab === 'preview' && <PreviewPanel />}
              {rightTab === 'tips' && <TipsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HISTORY PANEL
   ══════════════════════════════════════════════════ */

function HistoryPanel() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useAdminNotifications({
    limit: 30,
  });

  const unreadCount = data?.data.filter((n) => !n.isRead).length ?? 0;

  if (isLoading) {
    return <HistorySkeleton />;
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="No notifications yet"
        subtitle="Send one to see it here"
      />
    );
  }

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
            Recent
          </span>
          {unreadCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
          />
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {data.data.map((n, i) => (
          <HistoryRow
            key={n.id}
            notification={n}
            index={i}
            onClick={() => n.order?.id && navigate(`/orders/${n.order.id}`)}
          />
        ))}
      </div>

      {/* Footer */}
      {data.pages > 1 && (
        <div className="p-3 text-center border-t border-gray-100">
          <button
            onClick={() => navigate('/notifications/history')}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group"
          >
            View all {data.total}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HISTORY SKELETON
   ══════════════════════════════════════════════════ */

function HistorySkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Row skeletons */}
      <div className="divide-y divide-gray-100">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5"
            style={{ opacity: 1 - i * 0.12 }}
          >
            {/* Icon */}
            <div className="h-9 w-9 rounded-xl bg-gray-200 animate-pulse shrink-0" />

            <div className="flex-1 min-w-0 space-y-2">
              {/* Title + time */}
              <div className="flex items-center justify-between gap-3">
                <div
                  className="h-3 bg-gray-200 rounded animate-pulse"
                  style={{ width: `${45 + ((i * 13) % 35)}%` }}
                />
                <div className="h-2.5 w-8 bg-gray-100 rounded animate-pulse shrink-0" />
              </div>

              {/* Body lines */}
              <div className="space-y-1.5">
                <div
                  className="h-2.5 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${70 + ((i * 7) % 25)}%` }}
                />
                <div
                  className="h-2.5 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${40 + ((i * 11) % 30)}%` }}
                />
              </div>

              {/* Meta chips */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HISTORY ROW
   ══════════════════════════════════════════════════ */

const ICON_MAP: Record<
  NotificationType,
  { icon: any; color: string; label: string }
> = {
  ORDER_CREATED: {
    icon: Package,
    color: 'text-blue-600 bg-blue-50',
    label: 'Order',
  },
  ORDER_STATUS_CHANGED: {
    icon: Package,
    color: 'text-blue-600 bg-blue-50',
    label: 'Order',
  },
  ORDER_ASSIGNED: {
    icon: Bike,
    color: 'text-purple-600 bg-purple-50',
    label: 'Assigned',
  },
  ORDER_PICKED_UP: {
    icon: Package,
    color: 'text-orange-600 bg-orange-50',
    label: 'Picked up',
  },
  ORDER_DELIVERED: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    label: 'Delivered',
  },
  ORDER_FAILED: {
    icon: AlertCircle,
    color: 'text-red-600 bg-red-50',
    label: 'Failed',
  },
  ORDER_CANCELLED: {
    icon: X,
    color: 'text-red-600 bg-red-50',
    label: 'Cancelled',
  },
  COURIER_APPROVED: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    label: 'Approved',
  },
  COURIER_REJECTED: {
    icon: X,
    color: 'text-red-600 bg-red-50',
    label: 'Rejected',
  },
  PAYOUT_PAID: {
    icon: Wallet,
    color: 'text-emerald-600 bg-emerald-50',
    label: 'Payout',
  },
  RECEIVER_LINK: {
    icon: Package,
    color: 'text-indigo-600 bg-indigo-50',
    label: 'Link',
  },
  WELCOME: {
    icon: UserPlus,
    color: 'text-pink-600 bg-pink-50',
    label: 'Welcome',
  },
  SYSTEM: {
    icon: Settings,
    color: 'text-gray-600 bg-gray-100',
    label: 'System',
  },
  MANUAL: {
    icon: Bell,
    color: 'text-primary-600 bg-primary-50',
    label: 'Manual',
  },
};

function HistoryRow({
  notification: n,
  onClick,
  index = 0,
}: {
  notification: NotificationRow;
  onClick?: () => void;
  index?: number;
}) {
  const meta = ICON_MAP[n.type] ?? ICON_MAP.SYSTEM;
  const Icon = meta.icon;

  const recipient = n.customer
    ? n.customer.name || n.customer.phone
    : n.courier
      ? n.courier.name
      : n.staff
        ? n.staff.name
        : '—';

  return (
    <div
      onClick={onClick}
      style={{
        animationDelay: `${Math.min(index * 30, 300)}ms`,
      }}
      className={cn(
        'group flex items-start gap-3 p-3.5 transition-all animate-in fade-in slide-in-from-right-1 duration-300 fill-mode-backwards',
        onClick && 'cursor-pointer hover:bg-gray-50',
        !n.isRead && 'bg-primary-50/40 hover:bg-primary-50/60',
      )}
    >
      {/* Icon */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105',
            meta.color,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!n.isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-white animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
            {n.title}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 font-medium">
            {timeAgo(n.createdAt)}
          </span>
        </div>

        <p className="text-[11.5px] text-gray-600 line-clamp-2 leading-snug">
          {n.body}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded',
              n.accountType === 'CUSTOMER' && 'bg-blue-50 text-blue-700',
              n.accountType === 'COURIER' &&
                'bg-purple-50 text-purple-700',
              n.accountType === 'STAFF' && 'bg-gray-100 text-gray-600',
            )}
          >
            {n.accountType}
          </span>
          <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
            {recipient}
          </span>
          {n.order?.trackingNumber && (
            <>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-500 font-mono truncate">
                {n.order.trackingNumber}
              </span>
            </>
          )}
        </div>

        {/* Push status pill */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {n.pushSent ? (
            <span className="inline-flex items-center gap-1 text-[9.5px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium">
              <CheckCircle2 className="h-2.5 w-2.5" /> Delivered
            </span>
          ) : n.pushError ? (
            <span className="inline-flex items-center gap-1 text-[9.5px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-medium">
              <AlertCircle className="h-2.5 w-2.5" /> Failed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9.5px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded font-medium">
              <Clock className="h-2.5 w-2.5" /> Pending
            </span>
          )}
        </div>
      </div>

      {onClick && (
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-3 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/* ══════════════════════════════════════════════════
   PREVIEW PANEL
   ══════════════════════════════════════════════════ */

function PreviewPanel() {
  return (
    <div className="p-5 bg-gradient-to-b from-slate-50 to-white">
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide text-center mb-4">
        Lock Screen Preview
      </p>

      <div className="mx-auto max-w-[280px] rounded-[2rem] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-2.5 shadow-2xl ring-1 ring-black/10">
        {/* Notch */}
        <div className="flex justify-center mb-2">
          <div className="h-5 w-24 bg-black rounded-full" />
        </div>

        {/* Screen */}
        <div className="rounded-[1.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 text-white/80 text-[10px] font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span>●●●●</span>
              <span>WiFi</span>
              <span>100%</span>
            </div>
          </div>

          {/* Time */}
          <div className="text-center py-6">
            <p className="text-5xl font-light text-white tracking-tight">
              9:41
            </p>
            <p className="text-[11px] text-white/60 mt-0.5">
              Monday, September 25
            </p>
          </div>

          {/* Notification card */}
          <div className="px-3 pb-4">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-lg">
              <div className="flex items-start gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 text-white text-base shadow-sm">
                  🚚
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-semibold text-gray-900">
                      Deliver ET
                    </p>
                    <p className="text-[9px] text-gray-400">now</p>
                  </div>
                  <p className="text-[12px] font-semibold text-gray-900 truncate">
                    Notification title
                  </p>
                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-snug">
                    Your message will appear right here on the device.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4">
        Approximate representation
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TIPS PANEL
   ══════════════════════════════════════════════════ */

function TipsPanel() {
  return (
    <div className="p-4 space-y-3">
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 p-4">
        <h3 className="text-xs font-semibold text-gray-900 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary-600" />
          Best Practices
        </h3>
        <ul className="space-y-2 text-[11.5px] text-gray-700">
          <TipItem>
            Keep the title under <b>40 characters</b> — it truncates on
            Android.
          </TipItem>
          <TipItem>
            Use the body for the actionable detail (tracking number, ETA).
          </TipItem>
          <TipItem>
            Couriers must <b>open the app once</b> to register their device
            token.
          </TipItem>
        </ul>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5 text-gray-500" />
          Broadcast Topics
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <TopicChip value="couriers" />
          <TopicChip value="customers" />
          <TopicChip value="staff" />
          <TopicChip value="branch_<id>" />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          API Endpoints
        </h3>
        <div className="space-y-1.5 text-[10.5px] font-mono">
          <EndpointRow method="POST" path="/notifications/send" />
          <EndpointRow method="POST" path="/notifications/broadcast" />
          <EndpointRow method="POST" path="/notifications/register-token" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   STATS
   ══════════════════════════════════════════════════ */

function StatsRow() {
  const stats = useNotificationStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={Send}
        label="Total Sent"
        value={stats.data?.total}
        loading={stats.isLoading}
        accent="text-blue-600 bg-blue-50"
      />
      <StatCard
        icon={TrendingUp}
        label="Today"
        value={stats.data?.today}
        loading={stats.isLoading}
        accent="text-purple-600 bg-purple-50"
      />
      <StatCard
        icon={CheckCircle2}
        label="Delivered"
        value={stats.data?.pushed}
        loading={stats.isLoading}
        accent="text-green-600 bg-green-50"
      />
      <StatCard
        icon={AlertTriangle}
        label="Failed"
        value={stats.data?.failed}
        loading={stats.isLoading}
        accent="text-red-600 bg-red-50"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  loading,
}: {
  icon: any;
  label: string;
  value?: number;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <div
          className={cn(
            'h-7 w-7 rounded-md flex items-center justify-center',
            accent,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 tabular-nums">
          {value ?? '—'}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   RIGHT TAB BUTTON
   ══════════════════════════════════════════════════ */

function RightTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors relative',
        active
          ? 'text-primary-700 bg-white'
          : 'text-gray-500 hover:text-gray-800 hover:bg-white/50',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-600 rounded-full" />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════
   SHARED SMALL COMPONENTS
   ══════════════════════════════════════════════════ */

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-3 ring-1 ring-gray-100">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function Banner({
  type,
  icon: Icon,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  icon: any;
  message: string;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-200',
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800',
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function TipItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-primary-500 mt-0.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  );
}

function TopicChip({ value }: { value: string }) {
  return (
    <code className="inline-block bg-white border border-gray-200 px-2 py-1 rounded-md text-[10.5px] text-gray-700 font-mono hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
      {value}
    </code>
  );
}

function EndpointRow({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">
        {method}
      </span>
      <span className="text-gray-700 truncate">{path}</span>
    </div>
  );
}