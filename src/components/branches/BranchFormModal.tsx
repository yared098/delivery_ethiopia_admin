import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateBranch, useUpdateBranch } from '@/hooks/useBranches';
import { useRegions } from '@/hooks/useRegions';
import type { Branch } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  branch?: Branch | null;
}

export function BranchFormModal({ open, onClose, branch }: Props) {
  const isEdit = !!branch;

  const [form, setForm] = useState({
    regionId: '',
    name: '',
    code: '',
    city: '',
    woreda: '',
    address: '',
    phone: '',
    lat: '',
    lng: '',
  });

  const { data: regions = [] } = useRegions();
  const create = useCreateBranch();
  const update = useUpdateBranch();

  useEffect(() => {
    if (open) {
      setForm({
        regionId: branch?.regionId || '',
        name: branch?.name || '',
        code: branch?.code || '',
        city: branch?.city || '',
        woreda: branch?.woreda || '',
        address: branch?.address || '',
        phone: branch?.phone || '',
        lat: branch?.lat?.toString() || '',
        lng: branch?.lng?.toString() || '',
      });
    }
  }, [open, branch]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      regionId: form.regionId,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      city: form.city.trim() || undefined,
      woreda: form.woreda.trim() || undefined,
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
    };

    try {
      if (isEdit && branch) {
        await update.mutateAsync({ id: branch.id, data: payload });
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
      title={isEdit ? 'Edit Branch' : 'Create Branch'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Region */}
        <div>
          <label className="label">Region *</label>
          <select
            className="input"
            value={form.regionId}
            onChange={(e) => set('regionId', e.target.value)}
            required
            disabled={isEdit}
          >
            <option value="">Select region...</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>

        {/* Name + Code */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Branch Name *"
            placeholder="Adama Branch"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <Input
            label="Branch Code *"
            placeholder="ADA"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            required
            maxLength={10}
            pattern="[A-Z0-9-]+"
            title="Uppercase letters, digits, and dashes only"
          />
        </div>

        {/* City + Woreda */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="Adama"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <Input
            label="Woreda"
            placeholder="Adama Woreda"
            value={form.woreda}
            onChange={(e) => set('woreda', e.target.value)}
          />
        </div>

        {/* Address */}
        <Input
          label="Address / Landmark"
          placeholder="Main Street, next to post office"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
        />

        {/* Phone */}
        <Input
          label="Contact Phone"
          placeholder="0912345678"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
        />

        {/* GPS */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="8.54"
            value={form.lat}
            onChange={(e) => set('lat', e.target.value)}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="39.27"
            value={form.lng}
            onChange={(e) => set('lng', e.target.value)}
          />
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          💡 <b>Tip:</b> You can get lat/lng from Google Maps — right-click a spot → click coordinates to copy.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Create Branch'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
