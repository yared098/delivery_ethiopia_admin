import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Truck,
  CheckCircle2,
  Copy,
  Send,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
  Ban,
} from 'lucide-react';
import { LiveTrackingWidget } from '@/components/orders/LiveTrackingWidget';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useOrder, useCancelOrder, useSendReceiverLink } from '@/hooks/useOrders';
import { OrderStatus, ItemType } from '@/types';
import { toast } from 'sonner';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  AWAITING_RECEIVER_LOCATION: 'bg-purple-50 text-purple-700 border border-purple-200',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-blue-50 text-blue-700 border border-blue-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  PICKED_UP: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  IN_TRANSIT: 'bg-sky-50 text-sky-700 border border-sky-200',
  OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border border-orange-200',
  DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
  FAILED: 'bg-red-50 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
  RETURNED: 'bg-pink-50 text-pink-700 border border-pink-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  AWAITING_RECEIVER_LOCATION: 'Awaiting Receiver Location',
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  ASSIGNED: 'Assigned to Courier',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  PARCEL: 'Parcel',
  DOCUMENT: 'Document',
  BOX: 'Box',
  ENVELOPE: 'Envelope',
  FOOD: 'Food',
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  MEDICINE: 'Medicine',
  FRAGILE_ITEM: 'Fragile',
  OTHER: 'Other',
};

function formatDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id || null);
  const cancel = useCancelOrder();
  const sendLink = useSendReceiverLink();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Order not found</h2>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    toast.success('Tracking number copied');
  };

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync(order.id);
      setCancelOpen(false);
    } catch {}
  };

  const handleSendLink = async () => {
    try {
      await sendLink.mutateAsync(order.id);
    } catch {}
  };

  const isTerminal = order.status === 'DELIVERED' || order.status === 'CANCELLED';
  const needsReceiverLocation = order.status === 'AWAITING_RECEIVER_LOCATION';
  const activeLink = order.receiverLinks?.find((l) => l.status === 'ACTIVE');
  const showLiveTracking =
    order.courier &&
    ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.status);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold font-mono text-gray-900">
                {order.trackingNumber}
              </h1>
              <button
                onClick={copyTracking}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                title="Copy tracking number"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold ${STATUS_COLORS[order.status]}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
              <span className="text-sm text-gray-500">
                Created {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!isTerminal && (
              <>
                {needsReceiverLocation && (
                  <Button
                    onClick={handleSendLink}
                    loading={sendLink.isPending}
                  >
                    <Send className="h-4 w-4" />
                    {activeLink ? 'Resend Link' : 'Send Link'}
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={() => setCancelOpen(true)}
                >
                  <Ban className="h-4 w-4" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Warning if awaiting receiver location */}
      {needsReceiverLocation && (
        <div className="card p-4 mb-6 border-2 border-purple-200 bg-purple-50">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                Waiting for receiver to share location
              </p>
              <p className="text-xs text-purple-700 mt-1">
                The receiver needs to open the link and share their GPS location
                before we can calculate the price and assign a courier.
              </p>
              {activeLink && (
                <div className="mt-2 text-xs text-purple-800">
                  <b>Link expires:</b> {formatDate(activeLink.expiresAt)}
                  {activeLink.openedAt && (
                    <>
                      {' · '}
                      <b>Opened:</b> {formatDate(activeLink.openedAt)}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking (only when courier assigned and in transit) */}
      {showLiveTracking && (
        <div className="mb-6">
          <LiveTrackingWidget
            orderId={order.id}
            receiverLat={order.receiverLat}
            receiverLng={order.receiverLng}
          />
        </div>
      )}

      {/* Route */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Route
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender */}
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
              From
            </p>
            <p className="font-medium text-gray-900">{order.senderName}</p>
            <p className="text-sm text-gray-600 font-mono">{order.senderPhone}</p>
            {order.senderAddress && (
              <p className="text-sm text-gray-500 mt-1">{order.senderAddress}</p>
            )}
          </div>

          {/* Receiver */}
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
              To
            </p>
            <p className="font-medium text-gray-900">
              {order.receiverName || '(unknown)'}
            </p>
            <p className="text-sm text-gray-600 font-mono">{order.receiverPhone}</p>
            {order.receiverAddress && (
              <p className="text-sm text-gray-500 mt-1">{order.receiverAddress}</p>
            )}
            {order.receiverLat && order.receiverLng && (
              <p className="text-xs text-green-600 mt-1">
                📍 GPS: {order.receiverLat}, {order.receiverLng}
                {order.receiverLocationSource && ` (${order.receiverLocationSource})`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Package summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Items */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" /> Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.quantity}× {item.description || ITEM_TYPE_LABELS[item.type]}
                  </p>
                  {item.description && item.type !== 'OTHER' && (
                    <p className="text-xs text-gray-500">
                      {ITEM_TYPE_LABELS[item.type]}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1">
                    {item.isFragile && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                        Fragile
                      </span>
                    )}
                    {item.isRefrigerated && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        Refrigerated
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {item.weightKg * item.quantity} kg
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total weight</span>
              <span className="font-medium">{order.totalWeightKg} kg</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4">Payment & Pricing</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment party</span>
              <span className="font-medium">{order.paymentParty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment status</span>
              <span className="font-medium">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Distance</span>
              <span className="font-medium">
                {order.distanceKm ? `${order.distanceKm} km` : '—'}
              </span>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-base">
                <span className="font-medium">Delivery Fee</span>
                <span className="font-bold text-primary-600">
                  {order.deliveryFee.toFixed(2)} ETB
                </span>
              </div>
              {order.codAmount > 0 && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">COD (goods value)</span>
                  <span>{order.codAmount.toFixed(2)} ETB</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Courier */}
      {order.courier && (
        <div className="card p-6 mb-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" /> Assigned Courier
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
              {order.courier.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium">{order.courier.name}</p>
              <p className="text-sm text-gray-500 font-mono">{order.courier.phone}</p>
              {order.courier.vehiclePlate && (
                <p className="text-xs text-gray-400">
                  {order.courier.vehicleType} · {order.courier.vehiclePlate}
                </p>
              )}
            </div>
            {order.courier.rating != null && (
              <div className="text-right">
                <p className="text-yellow-500 text-lg">⭐ {order.courier.rating.toFixed(1)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {order.events?.length ? (
            order.events.map((ev) => (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary-500 mt-2" />
                  <div className="flex-1 w-px bg-gray-200" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">{STATUS_LABELS[ev.status]}</p>
                  {ev.note && <p className="text-xs text-gray-500">{ev.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(ev.createdAt)}
                    {ev.actorName && ` · by ${ev.actorName}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No events yet</p>
          )}
        </div>
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message={`Cancel order ${order.trackingNumber}? This cannot be undone.`}
        confirmText="Cancel Order"
        variant="danger"
        loading={cancel.isPending}
      />
    </div>
  );
}
