import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Users,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Edit2,
  Phone,
  Mail,
  Eye,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import {
  useCustomers,
  useSuspendCustomer,
  useReactivateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers';
import type { Customer } from '@/types';

export function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Customer | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'suspended' ? false : undefined,
    limit: 100,
  });

  const suspend = useSuspendCustomer();
  const reactivate = useReactivateCustomer();
  const del = useDeleteCustomer();

  const customers = data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await suspend.mutateAsync(suspendTarget.id);
      setSuspendTarget(null);
    } catch {}
  };

  const handleReactivate = async () => {
    if (!reactivateTarget) return;
    try {
      await reactivate.mutateAsync(reactivateTarget.id);
      setReactivateTarget(null);
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {}
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Customers"
        description="Senders and receivers registered in the system"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Register Customer
          </Button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            className="input max-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {customers.length} of {data?.total ?? 0}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Register your first customer to enable sending and receiving packages."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Register Customer
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3 text-right">Orders</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/customers/${c.id}`} className="flex items-center gap-3 group">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {c.name || '(no name)'}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{c.phone}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {c.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {c.defaultAddress || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {c._count ? (
                        <div className="space-y-0.5">
                          <div>{c._count.ordersSent} sent</div>
                          <div className="text-xs text-gray-400">
                            {c._count.ordersReceived} received
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                          <Ban className="h-3.5 w-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/customers/${c.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {c.isActive ? (
                          <button
                            onClick={() => setSuspendTarget(c)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setReactivateTarget(c)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Reactivate"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        customer={editing}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title="Suspend Customer"
        message={`Suspend "${suspendTarget?.name}"? They will be logged out of all sessions.`}
        confirmText="Suspend"
        variant="danger"
        loading={suspend.isPending}
      />

      <ConfirmDialog
        open={!!reactivateTarget}
        onClose={() => setReactivateTarget(null)}
        onConfirm={handleReactivate}
        title="Reactivate Customer"
        message={`Reactivate "${reactivateTarget?.name}"?`}
        confirmText="Reactivate"
        variant="primary"
        loading={reactivate.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Delete "${deleteTarget?.name}"? Customers with orders cannot be deleted — suspend instead.`}
        confirmText="Delete"
        variant="danger"
        loading={del.isPending}
      />
    </div>
  );
}
