import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useRejectCourier } from '@/hooks/useCouriers';
import type { Courier } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  courier: Courier | null;
}

export function RejectCourierModal({ open, onClose, courier }: Props) {
  const [reason, setReason] = useState('');
  const reject = useRejectCourier();

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier || !reason.trim()) return;
    try {
      await reject.mutateAsync({ id: courier.id, reason: reason.trim() });
      onClose();
    } catch {}
  };

  if (!courier) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Reject — ${courier.name}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Reason for rejection *</label>
          <textarea
            className="input min-h-[100px]"
            placeholder="e.g. Missing documents, invalid license..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={3}
            maxLength={500}
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500">{reason.length}/500</p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={reject.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={reject.isPending}>
            Reject Courier
          </Button>
        </div>
      </form>
    </Modal>
  );
}
