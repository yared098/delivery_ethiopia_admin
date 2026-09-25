import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Smartphone,
  List,
  PenSquare,
  TrendingUp,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { SendNotificationForm } from '@/components/notifications/SendNotificationForm';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import {
  NotificationFilters,
  type FilterState,
} from '@/components/notifications/NotificationFilters';
import { useNotificationStats } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

type Tab = 'compose' | 'history';

export function Notifications() {
  const [tab, setTab] = useState<Tab>('compose');

  // Compose tab feedback
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History tab state
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(1);

  const clear = () => {
    setSuccess(null);
    setError(null);
  };

  const stats = useNotificationStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Push Notifications"
        subtitle="Send manual FCM notifications and track delivery history."
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={Send}
          label="Total Sent"
          value={stats.data?.total ?? '—'}
          accent="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Today"
          value={stats.data?.today ?? '—'}
          accent="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats.data?.pushed ?? '—'}
          accent="text-green-600 bg-green-50"
        />
        <StatCard
          icon={AlertTriangle}
          label="Failed"
          value={stats.data?.failed ?? '—'}
          accent="text-red-600 bg-red-50"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="inline-flex p-1 bg-gray-100 rounded-lg mb-6">
        <button
          onClick={() => setTab('compose')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
            tab === 'compose'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          )}
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </button>
        <button
          onClick={() => setTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
            tab === 'history'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900',
          )}
        >
          <List className="h-4 w-4" />
          History
        </button>
      </div>

      {/* ── Tab content ── */}
      {tab === 'compose' && (
        <>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
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
                    }}
                    onError={(msg) => {
                      clear();
                      setError(msg);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <h3 className="text-xs font-semibold text-gray-700">
                    Notification Preview
                  </h3>
                </div>
                <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
                  <div className="mx-auto max-w-[260px] rounded-3xl bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-xl">
                    <div className="rounded-2xl bg-black/20 p-3 space-y-2">
                      <p className="text-[10px] text-white/60 text-center">
                        9:41
                      </p>
                      <div className="rounded-xl bg-white/95 p-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 text-white text-sm">
                            🚚
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-gray-900">
                              Deliver ET
                            </p>
                            <p className="text-xs font-medium text-gray-900 truncate mt-0.5">
                              Notification title
                            </p>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                              Your message will appear right here on the
                              device.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Tips
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-gray-700">
                  <TipItem>
                    Keep the title under <b>40 characters</b>.
                  </TipItem>
                  <TipItem>
                    Couriers must <b>open the app once</b> to register their
                    device token.
                  </TipItem>
                  <TipItem>
                    Broadcast topics: <code>couriers</code>,{' '}
                    <code>customers</code>, <code>branch_&lt;id&gt;</code>.
                  </TipItem>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'history' && (
        <div>
          <NotificationFilters
            value={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            onReset={() => {
              setFilters({});
              setPage(1);
            }}
          />
          <NotificationsList
            query={{ ...filters, page, limit: 20 }}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
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
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
        'flex items-start gap-3 p-4 rounded-xl border',
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
          className="text-xs opacity-60 hover:opacity-100"
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