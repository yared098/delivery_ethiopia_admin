import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCouriers } from '@/hooks/useCouriers';
import { useAssignCourier, useAutoAssignCourier } from '@/hooks/useOrders';
import { Bike, Loader2, Star, Sparkles, MapPin } from 'lucide-react';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function QuickAssignCourierModal({ open, onClose, order }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useCouriers({ status: 'APPROVED' as any, limit: 100 });
  const assign = useAssignCourier();
  const autoAssign = useAutoAssignCourier();

  const couriers = data?.data || [];

  const eligible = couriers.filter((c) => {
    if (!order) return false;
    if (c.maxWeightKg != null && order.totalWeightKg > c.maxWeightKg) return false;
    if (order.isFragile && !c.handlesFragile) return false;
    if (order.isRefrigerated && !c.handlesRefrigerated) return false;
    return true;
  });

  const handleAssign = async () => {
    if (!selectedId || !order) return;
    try {
      await assign.mutateAsync({ orderId: order.id, courierId: selectedId });
      onClose();
      setSelectedId(null);
    } catch {}
  };

  const handleAutoAssign = async () => {
    if (!order) return;
    try {
      await autoAssign.mutateAsync(order.id);
      onClose();
    } catch {}
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Courier — ${order.trackingNumber}`}
      size="lg"
    >
      {/* Order summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm flex items-center gap-4 flex-wrap">
        <div>
          <span className="text-gray-500">Weight:</span>{' '}
          <b>{order.totalWeightKg} kg</b>
        </div>
        <div>
          <span className="text-gray-500">Items:</span>{' '}
          <b>{order.items?.length ?? '—'}</b>
        </div>
        {order.isFragile && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
            📦 Fragile
          </span>
        )}
        {order.isRefrigerated && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
            ❄️ Refrigerated
          </span>
        )}
      </div>

      {/* Auto-assign */}
      <button
        onClick={handleAutoAssign}
        disabled={autoAssign.isPending}
        className="w-full flex items-center justify-center gap-2 p-3 mb-4 rounded-md border-2 border-dashed border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
      >
        {autoAssign.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Auto-assigning...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Auto-Assign Best Courier
          </>
        )}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase">Or pick manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Manual list */}
      <div className="space-y-2 max-h-[45vh] overflow-y-auto mb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : eligible.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bike className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No eligible couriers</p>
            <p className="text-xs mt-1">
              {couriers.length} courier(s) found but none match this order's
              requirements.
            </p>
          </div>
        ) : (
          eligible.map((c) => (
            <label
              key={c.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer transition-colors',
                selectedId === c.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <input
                type="radio"
                name="courier"
                checked={selectedId === c.id}
                onChange={() => setSelectedId(c.id)}
                className="sr-only"
              />
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm flex-shrink-0">
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-gray-500 font-mono">{c.phone}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Bike className="h-3 w-3" /> {c.vehicleType}
                  </span>
                  {c.rating != null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {c.rating.toFixed(1)}
                    </span>
                  )}
                  {c.currentLat != null && c.currentLng != null && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.currentLat.toFixed(3)}, {c.currentLng.toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
              {c.isOnline && (
                <span className="text-xs text-green-600 font-medium flex-shrink-0">
                  🟢 Online
                </span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="secondary" onClick={onClose} disabled={assign.isPending}>
          Cancel
        </Button>
        <Button onClick={handleAssign} loading={assign.isPending} disabled={!selectedId}>
          Assign Courier
        </Button>
      </div>
    </Modal>
  );
}
