import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  useCreateCourier,
  useUpdateCourier,
  useCourier,
} from '@/hooks/useCouriers';
import { useRegions } from '@/hooks/useRegions';
import { useBranches } from '@/hooks/useBranches';
import { VehicleType, type Courier } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  courier?: Courier | null;
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTORCYCLE: 'Motorcycle',
  BICYCLE: 'Bicycle',
  CAR: 'Car',
  VAN: 'Van',
  TRUCK: 'Truck',
};

export function CreateCourierModal({ open, onClose, courier }: Props) {
  const isEdit = !!courier;

  // Fetch full courier data on edit
  const { data: fullCourier, isLoading: loadingFull } = useCourier(
    isEdit && courier ? courier.id : null,
  );

  // Prefer fullCourier; fall back to list courier
  const source = fullCourier || courier;

  const [form, setForm] = useState({
    phone: '',
    name: '',
    email: '',
    regionId: '',
    branchId: '',
    vehicleType: 'MOTORCYCLE' as VehicleType,
    vehiclePlate: '',
    vehicleModel: '',
    vehicleColor: '',
    vehicleYear: '',
    licenseNumber: '',
    maxWeightKg: '',
    maxVolumeL: '',
    handlesFragile: false,
    handlesRefrigerated: false,
    nationalIdNumber: '',
    nationalIdImageUrl: null as string | null,
    licenseImageUrl: null as string | null,
    vehicleImageUrl: null as string | null,
    selfieUrl: null as string | null,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { data: regions = [] } = useRegions();
  const { data: branches = [] } = useBranches({
    regionId: form.regionId || undefined,
  });

  const create = useCreateCourier();
  const update = useUpdateCourier();
  const isPending = create.isPending || update.isPending;

  const filteredBranches = useMemo(
    () => branches.filter((b) => b.regionId === form.regionId),
    [branches, form.regionId],
  );

  // ✅ Fill form whenever `source` changes (including after full data loads)
  useEffect(() => {
    if (open && source) {
      setForm({
        phone: source.phone || '',
        name: source.name || '',
        email: source.email || '',
        regionId: source.regionId || '',
        branchId: source.branchId || '',
        vehicleType: source.vehicleType || 'MOTORCYCLE',
        vehiclePlate: source.vehiclePlate || '',
        vehicleModel: source.vehicleModel || '',
        vehicleColor: source.vehicleColor || '',
        vehicleYear: source.vehicleYear?.toString() || '',
        licenseNumber: source.licenseNumber || '',
        maxWeightKg: source.maxWeightKg?.toString() || '',
        maxVolumeL: source.maxVolumeL?.toString() || '',
        handlesFragile: source.handlesFragile || false,
        handlesRefrigerated: source.handlesRefrigerated || false,
        nationalIdNumber: source.nationalIdNumber || '',
        nationalIdImageUrl: source.nationalIdImageUrl || null,
        licenseImageUrl: source.licenseImageUrl || null,
        vehicleImageUrl: source.vehicleImageUrl || null,
        selfieUrl: source.selfieUrl || null,
        password: '',
      });
      setShowPassword(false);
    }
  }, [open, source]);

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      phone: form.phone,
      name: form.name,
      email: form.email || undefined,
      regionId: form.regionId,
      branchId: form.branchId,
      vehicleType: form.vehicleType,
      vehiclePlate: form.vehiclePlate || undefined,
      vehicleModel: form.vehicleModel || undefined,
      vehicleColor: form.vehicleColor || undefined,
      vehicleYear: form.vehicleYear ? Number(form.vehicleYear) : undefined,
      licenseNumber: form.licenseNumber || undefined,
      maxWeightKg: form.maxWeightKg ? Number(form.maxWeightKg) : undefined,
      maxVolumeL: form.maxVolumeL ? Number(form.maxVolumeL) : undefined,
      handlesFragile: form.handlesFragile,
      handlesRefrigerated: form.handlesRefrigerated,
      nationalIdNumber: form.nationalIdNumber || undefined,
      nationalIdImageUrl: form.nationalIdImageUrl || undefined,
      licenseImageUrl: form.licenseImageUrl || undefined,
      vehicleImageUrl: form.vehicleImageUrl || undefined,
      selfieUrl: form.selfieUrl || undefined,
    };

    if (form.password) payload.password = form.password;

    try {
      if (isEdit && courier) {
        await update.mutateAsync({ id: courier.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      // toast in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Courier — ${courier?.name || ''}` : 'Register Courier'}
      size="lg"
    >
      {loadingFull && isEdit ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading courier details...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Personal Info */}
          <section>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Personal Information</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone Number *"
                  placeholder="0912222222"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  required
                  autoFocus
                  pattern="(\+?251|0)?9\d{8}"
                  title="Ethiopian phone"
                />
                <Input
                  label="Full Name *"
                  placeholder="Abebe Courier"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                />
              </div>
              <Input
                label="Email (optional)"
                type="email"
                placeholder="abebe@deliver.et"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
          </section>

          {/* Assignment */}
          <section className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Region *</label>
                <select
                  className="input"
                  value={form.regionId}
                  onChange={(e) => {
                    set('regionId', e.target.value);
                    set('branchId', '');
                  }}
                  required
                >
                  <option value="">Select region...</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Branch *</label>
                <select
                  className="input"
                  value={form.branchId}
                  onChange={(e) => set('branchId', e.target.value)}
                  required
                  disabled={!form.regionId}
                >
                  <option value="">
                    {form.regionId ? 'Select branch...' : 'Select region first'}
                  </option>
                  {filteredBranches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Vehicle */}
          <section className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Vehicle</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Vehicle Type *</label>
                <select
                  className="input"
                  value={form.vehicleType}
                  onChange={(e) => set('vehicleType', e.target.value as VehicleType)}
                  required
                >
                  {Object.entries(VEHICLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Plate Number"
                placeholder="AA-3-12345"
                value={form.vehiclePlate}
                onChange={(e) => set('vehiclePlate', e.target.value)}
              />
              <Input
                label="Model"
                placeholder="Bajaj Boxer"
                value={form.vehicleModel}
                onChange={(e) => set('vehicleModel', e.target.value)}
              />
              <Input
                label="Color"
                placeholder="Red"
                value={form.vehicleColor}
                onChange={(e) => set('vehicleColor', e.target.value)}
              />
              <Input
                label="Year"
                type="number"
                placeholder="2020"
                value={form.vehicleYear}
                onChange={(e) => set('vehicleYear', e.target.value)}
              />
              <Input
                label="Driving License #"
                placeholder="DL-123456"
                value={form.licenseNumber}
                onChange={(e) => set('licenseNumber', e.target.value)}
              />
            </div>

            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.handlesFragile}
                  onChange={(e) => set('handlesFragile', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Handles fragile
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.handlesRefrigerated}
                  onChange={(e) => set('handlesRefrigerated', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Handles refrigerated
              </label>
            </div>
          </section>

          {/* Documents */}
          <section className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Identity Documents
            </h4>

            <Input
              label="National ID Number"
              placeholder="1234567890"
              value={form.nationalIdNumber}
              onChange={(e) => set('nationalIdNumber', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <FileUpload
                label="National ID Photo"
                value={form.nationalIdImageUrl}
                onChange={(url) => set('nationalIdImageUrl', url)}
              />
              <FileUpload
                label="Driving License Photo"
                value={form.licenseImageUrl}
                onChange={(url) => set('licenseImageUrl', url)}
              />
              <FileUpload
                label="Vehicle Photo"
                value={form.vehicleImageUrl}
                onChange={(url) => set('vehicleImageUrl', url)}
              />
              <FileUpload
                label="Selfie"
                value={form.selfieUrl}
                onChange={(url) => set('selfieUrl', url)}
              />
            </div>
          </section>

          {/* Password (create only) */}
          {!isEdit && (
            <section className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Login Credentials (optional)
              </h4>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave empty for OTP-only login"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </section>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              {isEdit ? 'Save Changes' : 'Register Courier'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
