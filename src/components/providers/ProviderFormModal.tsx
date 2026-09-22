import { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCreateProvider,
  useUpdateProvider,
  useUploadProviderLogo,
} from '@/hooks/usePaymentProviders';
import { PaymentProviderType, type PaymentProvider } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  provider?: PaymentProvider | null;
}

const TYPE_LABELS: Record<PaymentProviderType, string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Card',
  BANK: 'Bank',
  CASH: 'Cash',
  WALLET: 'Wallet',
  CRYPTO: 'Crypto',
};

const API_BASE = 'http://localhost:3000';

export function ProviderFormModal({ open, onClose, provider }: Props) {
  const isEdit = !!provider;

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'MOBILE_MONEY' as PaymentProviderType,
    logoUrl: null as string | null,
    color: '#3B82F6',
    sortOrder: 0,
    isEnabled: false,
    isTestMode: true,
    feePercent: 0,
    feeFixed: 0,
    minAmount: '',
    maxAmount: '',
    merchantId: '',
    webhookUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const create = useCreateProvider();
  const update = useUpdateProvider();
  const uploadLogo = useUploadProviderLogo();

  useEffect(() => {
    if (open) {
      setForm({
        code: provider?.code || '',
        name: provider?.name || '',
        description: provider?.description || '',
        type: provider?.type || 'MOBILE_MONEY',
        logoUrl: provider?.logoUrl || null,
        color: provider?.color || '#3B82F6',
        sortOrder: provider?.sortOrder ?? 0,
        isEnabled: provider?.isEnabled ?? false,
        isTestMode: provider?.isTestMode ?? true,
        feePercent: provider?.feePercent ?? 0,
        feeFixed: provider?.feeFixed ?? 0,
        minAmount: provider?.minAmount?.toString() || '',
        maxAmount: provider?.maxAmount?.toString() || '',
        merchantId: provider?.merchantId || '',
        webhookUrl: provider?.webhookUrl || '',
      });
    }
  }, [open, provider]);

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadLogo.mutateAsync(file);
      set('logoUrl', result.url);
    } catch {
      // toast in hook
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      code: form.code.toUpperCase().trim(),
      name: form.name.trim(),
      description: form.description || undefined,
      type: form.type,
      logoUrl: form.logoUrl || undefined,
      color: form.color || undefined,
      sortOrder: Number(form.sortOrder),
      isEnabled: form.isEnabled,
      isTestMode: form.isTestMode,
      feePercent: Number(form.feePercent),
      feeFixed: Number(form.feeFixed),
      minAmount: form.minAmount ? Number(form.minAmount) : undefined,
      maxAmount: form.maxAmount ? Number(form.maxAmount) : undefined,
      merchantId: form.merchantId || undefined,
      webhookUrl: form.webhookUrl || undefined,
    };

    try {
      if (isEdit && provider) {
        await update.mutateAsync({ id: provider.id, data: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch {
      // toast in hook
    }
  };

  const isPending = create.isPending || update.isPending;

  const logoSrc = form.logoUrl
    ? form.logoUrl.startsWith('http')
      ? form.logoUrl
      : `${API_BASE}${form.logoUrl}`
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${provider?.name}` : 'Add Payment Provider'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* ─── Basic Info ─── */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Info</h4>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name *"
              placeholder="Telebirr"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Code *"
              placeholder="TELEBIRR"
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              required
              pattern="[A-Z0-9_]+"
              title="Uppercase letters, digits, underscores"
            />
          </div>

          <div className="mt-4">
            <label className="label">Description</label>
            <textarea
              className="input min-h-[60px]"
              placeholder="Ethio Telecom mobile money wallet"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="mt-4">
            <label className="label">Type *</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => set('type', e.target.value as PaymentProviderType)}
              required
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ─── Branding ─── */}
        <section className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Branding</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Logo upload */}
            <div>
              <label className="label">Logo</label>
              {logoSrc ? (
                <div className="relative inline-block">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="h-20 w-20 object-contain rounded-md border border-gray-200 bg-white p-1"
                  />
                  <button
                    type="button"
                    onClick={() => set('logoUrl', null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-3 rounded-md border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload logo
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Color */}
            <div>
              <label className="label">Brand Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                  className="input flex-1 font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Fees & Limits ─── */}
        <section className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Fees & Limits
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fee % (percent)"
              type="number"
              step="0.01"
              min="0"
              placeholder="1.5"
              value={form.feePercent}
              onChange={(e) => set('feePercent', Number(e.target.value))}
            />
            <Input
              label="Fee (fixed ETB)"
              type="number"
              step="0.01"
              min="0"
              placeholder="2.00"
              value={form.feeFixed}
              onChange={(e) => set('feeFixed', Number(e.target.value))}
            />
            <Input
              label="Min amount (ETB)"
              type="number"
              step="0.01"
              min="0"
              placeholder="10"
              value={form.minAmount}
              onChange={(e) => set('minAmount', e.target.value)}
            />
            <Input
              label="Max amount (ETB)"
              type="number"
              step="0.01"
              min="0"
              placeholder="50000"
              value={form.maxAmount}
              onChange={(e) => set('maxAmount', e.target.value)}
            />
          </div>
        </section>

        {/* ─── Status ─── */}
        <section className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Status</h4>

          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => set('isEnabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Enabled (visible to users)
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isTestMode}
                onChange={(e) => set('isTestMode', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Test / sandbox mode
            </label>
          </div>

          <Input
            label="Sort Order"
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(e) => set('sortOrder', Number(e.target.value))}
          />
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEdit ? 'Save Changes' : 'Add Provider'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
