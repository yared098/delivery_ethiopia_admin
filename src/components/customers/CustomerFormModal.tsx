import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import type { Customer } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerFormModal({ open, onClose, customer }: Props) {
  const isEdit = !!customer;

  const [form, setForm] = useState({
    phone: '',
    name: '',
    email: '',
    defaultAddress: '',
    defaultLat: '',
    defaultLng: '',
  });

  const create = useCreateCustomer();
  const update = useUpdateCustomer();

  useEffect(() => {
    if (open) {
      setForm({
        phone: customer?.phone || '',
        name: customer?.name || '',
        email: customer?.email || '',
        defaultAddress: customer?.defaultAddress || '',
        defaultLat: customer?.defaultLat?.toString() || '',
        defaultLng: customer?.defaultLng?.toString() || '',
      });
    }
  }, [open, customer]);

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      phone: form.phone,
      name: form.name,
      email: form.email || undefined,
      defaultAddress: form.defaultAddress || undefined,
      defaultLat: form.defaultLat ? Number(form.defaultLat) : undefined,
      defaultLng: form.defaultLng ? Number(form.defaultLng) : undefined,
    };

    try {
      if (isEdit && customer) {
        await update.mutateAsync({ id: customer.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {}
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Customer — ${customer?.name}` : 'Register Customer'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            placeholder="0911223344"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            required
            autoFocus
            pattern="(\+?251|0)?9\d{8}"
            title="Ethiopian phone"
          />
          <Input
            label="Full Name *"
            placeholder="Almaz Tesfaye"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <Input
          label="Email (optional)"
          type="email"
          placeholder="almaz@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />

        <Input
          label="Default Address (optional)"
          placeholder="Bole, Addis Ababa"
          value={form.defaultAddress}
          onChange={(e) => set('defaultAddress', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude (optional)"
            type="number"
            step="any"
            placeholder="9.03"
            value={form.defaultLat}
            onChange={(e) => set('defaultLat', e.target.value)}
          />
          <Input
            label="Longitude (optional)"
            type="number"
            step="any"
            placeholder="38.74"
            value={form.defaultLng}
            onChange={(e) => set('defaultLng', e.target.value)}
          />
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          💡 Tip: Get lat/lng from Google Maps — right-click a spot → click coordinates to copy.
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
