import { useNavigate } from 'react-router-dom';
import {
  Package,
  Bike,
  CheckCircle2,
  XCircle,
  Wallet,
  UserPlus,
  Bell,
  Settings,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAdminNotifications,
  type NotificationListQuery,
  type NotificationRow,
  type NotificationType,
} from '@/hooks/useNotifications';

const ICON_MAP: Record<NotificationType, { icon: any; color: string }> = {
  ORDER_CREATED: { icon: Package, color: 'text-blue-600 bg-blue-50' },
  ORDER_STATUS_CHANGED: { icon: Package, color: 'text-blue-600 bg-blue-50' },
  ORDER_ASSIGNED: { icon: Bike, color: 'text-purple-600 bg-purple-50' },
  ORDER_PICKED_UP: { icon: Package, color: 'text-orange-600 bg-orange-50' },
  ORDER_DELIVERED: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
  },
  ORDER_FAILED: { icon: AlertCircle, color: 'text-red-600 bg-red-50' },
  ORDER_CANCELLED: { icon: XCircle, color: 'text-red-600 bg-red-50' },
  COURIER_APPROVED: {
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
  },
  COURIER_REJECTED: { icon: XCircle, color: 'text-red-600 bg-red-50' },
  PAYOUT_PAID: { icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
  RECEIVER_LINK: { icon: Package, color: 'text-indigo-600 bg-indigo-50' },
  WELCOME: { icon: UserPlus, color: 'text-pink-600 bg-pink-50' },
  SYSTEM: { icon: Settings, color: 'text-gray-600 bg-gray-100' },
  MANUAL: { icon: Bell, color: 'text-primary-600 bg-primary-50' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

type Props = {
  query: NotificationListQuery;
  onPageChange: (page: number) => void;
};

export function NotificationsList({ query, onPageChange }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminNotifications(query);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Failed to load notifications
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Bell className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">
          No notifications yet
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Notifications appear here when orders change or couriers get
          approved.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
        {data.data.map((n) => (
          <Row
            key={n.id}
            notification={n}
            onClick={() => {
              if (n.order?.id) {
                navigate(`/orders/${n.order.id}`);
              }
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>
            Page {data.page} of {data.pages} · {data.total} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={data.page <= 1}
              onClick={() => onPageChange(data.page - 1)}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={data.page >= data.pages}
              onClick={() => onPageChange(data.page + 1)}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  notification: n,
  onClick,
}: {
  notification: NotificationRow;
  onClick?: () => void;
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
      className={cn(
        'flex items-start gap-3 p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50',
        !n.isRead && 'bg-primary-50/30',
      )}
    >
      <div
        className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
          meta.color,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {n.title}
          </p>
          {!n.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{n.body}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
          <span className="font-medium uppercase tracking-wide">
            {n.accountType}
          </span>
          <span>·</span>
          <span className="truncate">{recipient}</span>
          {n.order && (
            <>
              <span>·</span>
              <span className="font-mono">{n.order.trackingNumber}</span>
            </>
          )}
          <span>·</span>
          <span>{timeAgo(n.createdAt)}</span>
          {n.pushSent && (
            <span className="text-green-600">· ✅ pushed</span>
          )}
          {n.pushError && (
            <span className="text-red-600">· ⚠️ {n.pushError}</span>
          )}
        </div>
      </div>

      {onClick && (
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-3" />
      )}
    </div>
  );
}