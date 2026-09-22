import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCouriers } from '@/hooks/useCouriers';
import { useAssignCourier } from '@/hooks/useOrders';
import { Bike, Loader2, Star, MapPin } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderWeightKg: number;
  needsFragile: boolean;
  needsRefrigerated: boolean;
}

export function PickCourierModal({
  open,
  onClose,
  orderId,
  orderWeightKg,
  needsFragile,
  needsRefrigerated,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useCouriers({ status: 'APPROVED' as any, limit: 100 });
  const assign = useAssignCourier();

  const couriers = data?.data || [];

  const eligible = couriers.filter((c) => {
    if (c.maxWeightKg != null && orderWeightKg > c.maxWeightKg) return false;
    if (needsFragile && !c.handlesFragile) return false;
    if (needsRefrigerated && !c.handlesRefrigerated) return false;
    return true;
  });

  const handleAssign = async () => {
    if (!selectedId) return;
    try {
      await assign.mutateAsync({ orderId, courierId: selectedId });
      onClose();
    } catch {}
  };

  return (
    <Modal open={open} onClose={onClose} title="Pick a Courier" size="lg">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : eligible.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bike className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No eligible couriers</p>
            <p className="text-xs mt-1">
              {couriers.length} courier(s) found but none match the requirements
              ({orderWeightKg} kg
              {needsFragile && ', fragile'}
              {needsRefrigerated && ', refrigerated'})
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {eligible.map((c) => (
              <label
                key={c.id}
                className={`flex items-center gap-3 p-3 rounded-md border-2 cursor-pointer transition-colors ${
                  selectedId === c.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Bike className="h-3 w-3" /> {c.vehicleType}
                    </span>
                    {c.rating != null && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        {c.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                {c.isOnline && (
                  <span className="text-xs text-green-600 font-medium">🟢 Online</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
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
