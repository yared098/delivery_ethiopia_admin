import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { SendNotificationForm } from '@/components/notifications/SendNotificationForm';
import { cn } from '@/lib/utils';

export function Notifications() {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clear = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Push Notifications"
        subtitle="Send manual FCM notifications to customers, couriers, or staff."
      />

      {/* ══════════════════════════════════════════════
          Feedback banners (animated)
      ══════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════
          Two-column layout
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Form (2/3) ─── */}
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

        {/* ─── Preview + Tips (1/3) ─── */}
        <div className="space-y-6">
          {/* Phone preview */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-700">
                Notification Preview
              </h3>
            </div>
            <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
              {/* Faux lock-screen phone */}
              <div className="mx-auto max-w-[260px] rounded-3xl bg-gradient-to-b from-slate-900 to-slate-700 p-3 shadow-xl">
                <div className="rounded-2xl bg-black/20 backdrop-blur-sm p-3 space-y-2">
                  <p className="text-[10px] text-white/60 text-center">
                    9:41
                  </p>
                  <div className="rounded-xl bg-white/95 backdrop-blur p-3 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 text-white text-sm">
                        🚚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-semibold text-gray-900">
                            Deliver ET
                          </p>
                          <p className="text-[9px] text-gray-400">now</p>
                        </div>
                        <p className="text-xs font-medium text-gray-900 truncate mt-0.5">
                          Notification title
                        </p>
                        <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                          Your message will appear right here on the device.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Approximate representation
              </p>
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Tips for great notifications
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-700">
              <TipItem>Keep the title under <b>40 characters</b> — it truncates on Android.</TipItem>
              <TipItem>Use the body for the actionable detail (tracking number, ETA).</TipItem>
              <TipItem>Couriers must <b>open the app once</b> to register their device token.</TipItem>
              <TipItem>
                Broadcast topics are useful for <code className="bg-white px-1 rounded">couriers</code>,{' '}
                <code className="bg-white px-1 rounded">customers</code>, and{' '}
                <code className="bg-white px-1 rounded">branch_&lt;id&gt;</code>.
              </TipItem>
            </ul>
          </div>

          {/* Endpoint reference */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                API Endpoints
              </h3>
            </div>
            <div className="space-y-2 text-[11px] font-mono">
              <EndpointRow method="POST" path="/notifications/send" />
              <EndpointRow method="POST" path="/notifications/broadcast" />
              <EndpointRow method="POST" path="/notifications/register-token" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════ */

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

function EndpointRow({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
        {method}
      </span>
      <span className="text-gray-700 truncate">{path}</span>
    </div>
  );
}