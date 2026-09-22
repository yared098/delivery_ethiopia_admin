import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  CreditCard,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Hash,
  Percent,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProviderFormModal } from '@/components/providers/ProviderFormModal';
import {
  usePaymentProviders,
  useToggleProvider,
  useDeleteProvider,
} from '@/hooks/usePaymentProviders';
import { PaymentProviderType, type PaymentProvider } from '@/types';

const TYPE_LABELS: Record<PaymentProviderType, string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Card',
  BANK: 'Bank',
  CASH: 'Cash',
  WALLET: 'Wallet',
  CRYPTO: 'Crypto',
};

const TYPE_COLORS: Record<PaymentProviderType, string> = {
  MOBILE_MONEY: 'bg-green-50 text-green-700 border border-green-200',
  CARD: 'bg-blue-50 text-blue-700 border border-blue-200',
  BANK: 'bg-purple-50 text-purple-700 border border-purple-200',
  CASH: 'bg-amber-50 text-amber-700 border border-amber-200',
  WALLET: 'bg-pink-50 text-pink-700 border border-pink-200',
  CRYPTO: 'bg-orange-50 text-orange-700 border border-orange-200',
};

const API_BASE = 'http://localhost:3000';

export function PaymentProviders() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentProvider | null>(null);
  const [deleting, setDeleting] = useState<PaymentProvider | null>(null);

  const { data: providers = [], isLoading } = usePaymentProviders({
    search: search || undefined,
    type: (typeFilter as PaymentProviderType) || undefined,
    isEnabled:
      statusFilter === 'enabled'
        ? true
        : statusFilter === 'disabled'
        ? false
        : undefined,
  });

  const toggle = useToggleProvider();
  const del = useDeleteProvider();

  const filtered = useMemo(() => providers, [providers]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: PaymentProvider) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleToggle = async (p: PaymentProvider) => {
    try {
      await toggle.mutateAsync(p.id);
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {}
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Payment Providers"
        description="Manage Telebirr, Chapa, and other payment methods"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Provider
          </Button>
        }
      />

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            className="input max-w-[180px]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <select
            className="input max-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {filtered.length} providers
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={3} columns={4} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={search || typeFilter || statusFilter ? 'No providers match your filters' : 'No payment providers yet'}
            description={
              search || typeFilter || statusFilter
                ? 'Try a different filter.'
                : 'Add Telebirr, Chapa, or other payment methods to enable payments.'
            }
            action={
              !search && !typeFilter && !statusFilter ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add Provider
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const logoSrc = p.logoUrl
                ? p.logoUrl.startsWith('http')
                  ? p.logoUrl
                  : `${API_BASE}${p.logoUrl}`
                : null;

              return (
                <div
                  key={p.id}
                  className="p-5 flex items-start gap-5 hover:bg-gray-50 transition-colors"
                >
                  {/* Logo */}
                  <div
                    className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-white border border-gray-200"
                    style={!logoSrc && p.color ? { backgroundColor: p.color + '20' } : undefined}
                  >
                    {logoSrc ? (
                      <img src={logoSrc} alt={p.name} className="h-full w-full object-contain p-1" />
                    ) : (
                      <CreditCard className="h-6 w-6" style={{ color: p.color || '#666' }} />
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[p.type]}`}>
                        {TYPE_LABELS[p.type]}
                      </span>
                      {p.isEnabled ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <Power className="h-3 w-3" /> ENABLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          <PowerOff className="h-3 w-3" /> DISABLED
                        </span>
                      )}
                      {p.isTestMode && (
                        <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          TEST
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{p.code}</code>
                      {p.description && <span className="ml-2">{p.description}</span>}
                    </p>

                    {/* Fees row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Fee: {p.feePercent}%
                      </span>
                      {p.feeFixed > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          + {p.feeFixed} ETB
                        </span>
                      )}
                      {p.minAmount !== null && p.maxAmount !== null && (
                        <span className="inline-flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {p.minAmount} - {p.maxAmount} ETB
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        Order: {p.sortOrder}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="secondary"
                      onClick={() => handleToggle(p)}
                      loading={toggle.isPending}
                      className="text-xs px-3 py-1.5"
                    >
                      {p.isEnabled ? (
                        <>
                          <PowerOff className="h-3.5 w-3.5" /> Disable
                        </>
                      ) : (
                        <>
                          <Power className="h-3.5 w-3.5" /> Enable
                        </>
                      )}
                    </Button>

                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleting(p)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProviderFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        provider={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Payment Provider"
        message={`Delete "${deleting?.name}"? Users will no longer see this option at checkout.`}
        confirmText="Delete"
        variant="danger"
        loading={del.isPending}
      />
    </div>
  );
}
