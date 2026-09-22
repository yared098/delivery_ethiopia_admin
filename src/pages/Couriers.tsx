import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Bike,
  Ban,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  Edit2,
  Phone,
  Eye,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CreateCourierModal } from '@/components/couriers/CreateCourierModal';
import { RejectCourierModal } from '@/components/couriers/RejectCourierModal';
import {
  useCouriers,
  useApproveCourier,
  useSuspendCourier,
  useReactivateCourier,
} from '@/hooks/useCouriers';
import { useRegions } from '@/hooks/useRegions';
import { CourierStatus, VehicleType, type Courier } from '@/types';

const STATUS_COLORS: Record<CourierStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-green-50 text-green-700 border border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
  SUSPENDED: 'bg-gray-100 text-gray-700 border border-gray-200',
};

const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTORCYCLE: 'Motorcycle',
  BICYCLE: 'Bicycle',
  CAR: 'Car',
  VAN: 'Van',
  TRUCK: 'Truck',
};

export function Couriers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Courier | null>(null);
  const [rejecting, setRejecting] = useState<Courier | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Courier | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<Courier | null>(null);

  const { data, isLoading } = useCouriers({
    search: search || undefined,
    status: (statusFilter as CourierStatus) || undefined,
    vehicleType: (vehicleFilter as VehicleType) || undefined,
    regionId: regionFilter || undefined,
    limit: 100,
  });

  const { data: regions = [] } = useRegions();
  const approve = useApproveCourier();
  const suspend = useSuspendCourier();
  const reactivate = useReactivateCourier();

  const couriers = data?.data || [];

  const regionMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((r) => { map[r.id] = r.name; });
    return map;
  }, [regions]);

  const openCreate = () => {
    setEditing(null);
    setCreateOpen(true);
  };

  const openEdit = (c: Courier) => {
    setEditing(c);
    setCreateOpen(true);
  };

  const handleApprove = async (c: Courier) => {
    try {
      await approve.mutateAsync(c.id);
    } catch {}
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

  return (
    <div className="p-8">
      <PageHeader
        title="Couriers"
        description="Manage delivery drivers"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Register Courier
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
              placeholder="Search name, phone, plate..."
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
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            className="input max-w-[160px]"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="">All Vehicles</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="BICYCLE">Bicycle</option>
            <option value="CAR">Car</option>
            <option value="VAN">Van</option>
            <option value="TRUCK">Truck</option>
          </select>

          <select
            className="input max-w-[180px]"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {couriers.length} of {data?.total ?? 0}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : couriers.length === 0 ? (
          <EmptyState
            icon={Bike}
            title="No couriers yet"
            description="Register your first courier to start delivering packages."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Register Courier
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Courier</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {/* ─── Courier name now links to detail page ─── */}
                    <td className="px-6 py-4">
                      <Link
                        to={`/couriers/${c.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{VEHICLE_LABELS[c.vehicleType]}</p>
                      {c.vehiclePlate && (
                        <p className="text-xs text-gray-500">{c.vehiclePlate}</p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {regionMap[c.regionId] || '—'}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                      {c.status === 'REJECTED' && c.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 truncate max-w-[200px]" title={c.rejectionReason}>
                          {c.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* ─── NEW: View detail button ─── */}
                        <Link
                          to={`/couriers/${c.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {c.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(c)}
                              disabled={approve.isPending}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejecting(c)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {c.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => openEdit(c)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setSuspendTarget(c)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Suspend"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {(c.status === 'SUSPENDED' || c.status === 'REJECTED') && (
                          <button
                            onClick={() => setReactivateTarget(c)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Reactivate"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCourierModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        courier={editing}
      />

      <RejectCourierModal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        courier={rejecting}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title="Suspend Courier"
        message={`Suspend "${suspendTarget?.name}"? They will be logged out and cannot accept deliveries.`}
        confirmText="Suspend"
        variant="danger"
        loading={suspend.isPending}
      />

      <ConfirmDialog
        open={!!reactivateTarget}
        onClose={() => setReactivateTarget(null)}
        onConfirm={handleReactivate}
        title="Reactivate Courier"
        message={`Reactivate "${reactivateTarget?.name}"? They will be able to accept deliveries again.`}
        confirmText="Reactivate"
        variant="primary"
        loading={reactivate.isPending}
      />
    </div>
  );
}
