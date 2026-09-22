import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateRegion, useUpdateRegion } from '@/hooks/useRegions';
import type { Region } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  region?: Region | null;
}

export function RegionFormModal({ open, onClose, region }: Props) {
  const isEdit = !!region;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const create = useCreateRegion();
  const update = useUpdateRegion();

  useEffect(() => {
    if (open) {
      setName(region?.name || '');
      setCode(region?.code || '');
    }
  }, [open, region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) return;

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
    };

    try {
      if (isEdit && region) {
        await update.mutateAsync({ id: region.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      // toast handled in hook
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Region' : 'Create Region'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Region Name"
          placeholder="e.g. Oromia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Region Code"
          placeholder="e.g. OR"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          maxLength={5}
          pattern="[A-Z]+"
          title="Uppercase letters only (2–5 chars)"
        />

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Region'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
