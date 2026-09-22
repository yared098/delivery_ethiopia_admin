import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Package,
  Eye,
  MapPin,
  ArrowRight,
  Bike,
  UserCheck,
  UserX,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuickAssignCourierModal } from '@/components/orders/QuickAssignCourierModal';
import { useOrders, useUnassignCourier } from '@/hooks/useOrders';
import { OrderStatus, type Order } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  AWAITING_RECEIVER_LOCATION:
    'bg-purple-50 text-purple-700 border border-purple-200',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-blue-50 text-blue-700 border border-blue-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  PICKED_UP: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  IN_TRANSIT: 'bg-sky-50 text-sky-700 border border-sky-200',
  OUT_FOR_DELIVERY: 'bg-orange-50 text-orange-700 border border-orange-200',
  DELIVERED: 'bg-green-50 text-green-700 border border-green-200',
  FAILED: 'bg-red-50 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border border-gray-200',
  RETURNED: 'bg-pink-50 text-pink-700 border border-pink-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  AWAITING_RECEIVER_LOCATION: 'Awaiting Location',
  PENDING_PAYMENT: 'Pending Payment',
  PAID: 'Paid',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

// Statuses where courier can be assigned
const ASSIGNABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
];

// Statuses where courier can't be unassigned (already in motion)
const UNASSIGN_BLOCKED: OrderStatus[] = [
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

export function Orders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [assignTarget, setAssignTarget] = useState<Order | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<Order | null>(null);

  const { data, isLoading } = useOrders({
    search: search || undefined,
    status: (statusFilter as OrderStatus) || undefined,
    limit: 100,
  });

  const unassign = useUnassignCourier();
  const orders = data?.data || [];

  const handleUnassign = async () => {
    if (!unassignTarget) return;
    try {
      await unassign.mutateAsync(unassignTarget.id);
      setUnassignTarget(null);
    } catch {}
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Orders"
        description="Manage deliveries and packages"
        actions={
          <Link to="/orders/new">
            <Button>
              <Plus className="h-4 w-4" /> New Order
            </Button>
          </Link>
        }
      />

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tracking, sender, receiver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            className="input max-w-[200px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {orders.length} of {data?.total ?? 0}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={7} />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Create your first order to start delivering packages."
            action={
              <Link to="/orders/new">
                <Button>
                  <Plus className="h-4 w-4" /> New Order
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Tracking</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Courier</th>
                  <th className="px-6 py-3 text-right">Items</th>
                  <th className="px-6 py-3 text-right">Fee</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const canAssign =
                    !o.courier && ASSIGNABLE_STATUSES.includes(o.status);
                  const canUnassign =
                    o.courier && !UNASSIGN_BLOCKED.includes(o.status);

                  return (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      {/* Tracking */}
                      <td className="px-6 py-4">
                        <Link to={`/orders/${o.id}`} className="group">
                          <p className="font-mono text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {o.trackingNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(o.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </Link>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {o.senderName}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            {o.receiverName || o.receiverPhone}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                            STATUS_COLORS[o.status],
                          )}
                        >
                          {STATUS_LABELS[o.status]}
                        </span>
                      </td>

                      {/* Courier column */}
                      <td className="px-6 py-4">
                        {o.courier ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-xs flex-shrink-0">
                              {o.courier.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="text-xs flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">
                                {o.courier.name}
                              </p>
                              <p className="text-gray-500 font-mono">
                                {o.courier.phone}
                              </p>
                            </div>
                            {canUnassign && (
                              <button
                                onClick={() => setUnassignTarget(o)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                title="Unassign courier"
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ) : canAssign ? (
                          <button
                            onClick={() => setAssignTarget(o)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-colors"
                            title="Assign courier"
                          >
                            <Bike className="h-3.5 w-3.5" />
                            Assign
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Not assigned
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {o._count?.items ?? '—'}
                      </td>

                      {/* Fee */}
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {o.deliveryFee.toFixed(2)} ETB
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canAssign && (
                            <button
                              onClick={() => setAssignTarget(o)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="Assign courier"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                          <Link
                            to={`/orders/${o.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign courier modal */}
      <QuickAssignCourierModal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        order={assignTarget}
      />

      {/* Unassign confirm */}
      <ConfirmDialog
        open={!!unassignTarget}
        onClose={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
        title="Unassign Courier"
        message={`Unassign ${
          unassignTarget?.courier?.name || 'the courier'
        } from ${unassignTarget?.trackingNumber}? The order will revert to "Pending Payment".`}
        confirmText="Unassign"
        variant="danger"
        loading={unassign.isPending}
      />
    </div>
  );
}
