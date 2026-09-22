import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Bike,
  MapPin,
  CheckCircle2,
  XCircle,
  Ban,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Edit2,
  Loader2,
  Image as ImageIcon,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CreateCourierModal } from '@/components/couriers/CreateCourierModal';
import {
  useCourierDetail,
  useApproveCourier,
  useRejectCourier,
  useSuspendCourier,
  useReactivateCourier,
} from '@/hooks/useCouriers';
import { CourierStatus, VehicleType } from '@/types';

const VEHICLE_LABELS: Record<VehicleType, string> = {
  MOTORCYCLE: 'Motorcycle',
  BICYCLE: 'Bicycle',
  CAR: 'Car',
  VAN: 'Van',
  TRUCK: 'Truck',
};

const STATUS_COLORS: Record<CourierStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-green-50 text-green-700 border border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
  SUSPENDED: 'bg-gray-100 text-gray-700 border border-gray-200',
};

const API_BASE = 'http://localhost:3000';

function formatDate(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function imageSrc(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

export function CourierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: courier, isLoading, error } = useCourierDetail(id || null);
  const approve = useApproveCourier();
  const reject = useRejectCourier();
  const suspend = useSuspendCourier();
  const reactivate = useReactivateCourier();

  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !courier) {
    return (
      <div className="p-8">
        <div className="card p-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Courier not found</h2>
          <p className="text-gray-500 mb-4">
            The courier you're looking for doesn't exist or was deleted.
          </p>
          <Button onClick={() => navigate('/couriers')}>
            <ArrowLeft className="h-4 w-4" /> Back to Couriers
          </Button>
        </div>
      </div>
    );
  }

  const stats = (courier as any).stats || {
    totalDeliveries: courier.totalDeliveries,
    totalFailed: courier.totalFailed,
    totalPending: 0,
    totalInTransit: 0,
    totalEarnings: 0,
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync(courier.id);
    } catch {}
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await reject.mutateAsync({ id: courier.id, reason: rejectReason.trim() });
      setRejectOpen(false);
      setRejectReason('');
    } catch {}
  };

  const handleSuspend = async () => {
    try {
      await suspend.mutateAsync(courier.id);
      setSuspendOpen(false);
    } catch {}
  };

  const handleReactivate = async () => {
    try {
      await reactivate.mutateAsync(courier.id);
      setReactivateOpen(false);
    } catch {}
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        to="/couriers"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Couriers
      </Link>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-3xl flex-shrink-0">
            {courier.name?.[0]?.toUpperCase() || '?'}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{courier.name}</h1>
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[courier.status]}`}>
                    {courier.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    {courier.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Bike className="h-4 w-4" />
                    {VEHICLE_LABELS[courier.vehicleType]}
                  </span>
                  {courier.isOnline ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                      🟢 Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      ⚫ Offline
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {courier.phone}
                  </span>
                  {courier.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {courier.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {courier.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={handleApprove}
                      loading={approve.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setRejectOpen(true)}
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {courier.status === 'APPROVED' && (
                  <>
                    <Button variant="secondary" onClick={() => setEditOpen(true)}>
                      <Edit2 className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="danger" onClick={() => setSuspendOpen(true)}>
                      <Ban className="h-4 w-4" /> Suspend
                    </Button>
                  </>
                )}
                {(courier.status === 'SUSPENDED' || courier.status === 'REJECTED') && (
                  <Button onClick={() => setReactivateOpen(true)}>
                    <ShieldCheck className="h-4 w-4" /> Reactivate
                  </Button>
                )}
              </div>
            </div>

            {courier.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2 rounded">
                <b>Rejection reason:</b> {courier.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Package}
          label="Total Deliveries"
          value={stats.totalDeliveries}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={courier.totalDeliveries}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={XCircle}
          label="Failed"
          value={courier.totalFailed}
          color="text-red-600 bg-red-50"
        />
        <StatCard
          icon={DollarSign}
          label="Total Earned"
          value={`${stats.totalEarnings} ETB`}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Two columns: Vehicle + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vehicle */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4" /> Vehicle
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Type" value={VEHICLE_LABELS[courier.vehicleType]} />
            <Row label="Plate" value={courier.vehiclePlate || '—'} />
            <Row label="Model" value={courier.vehicleModel || '—'} />
            <Row label="Color" value={courier.vehicleColor || '—'} />
            <Row label="Year" value={courier.vehicleYear?.toString() || '—'} />
            <Row label="License #" value={courier.licenseNumber || '—'} />
            <Row
              label="Capabilities"
              value={
                <>
                  {courier.handlesFragile && <span className="inline-block mr-2">📦 Fragile</span>}
                  {courier.handlesRefrigerated && <span>❄️ Refrigerated</span>}
                  {!courier.handlesFragile && !courier.handlesRefrigerated && <span className="text-gray-400">Standard</span>}
                </>
              }
            />
          </dl>
        </div>

        {/* Documents */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Documents
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <DocThumb label="National ID" url={courier.nationalIdImageUrl} />
            <DocThumb label="License" url={courier.licenseImageUrl} />
            <DocThumb label="Vehicle" url={courier.vehicleImageUrl} />
            <DocThumb label="Selfie" url={courier.selfieUrl} />
          </div>
          {courier.nationalIdNumber && (
            <div className="mt-4 pt-4 border-t text-sm">
              <span className="text-gray-500">National ID Number:</span>{' '}
              <span className="font-mono">{courier.nationalIdNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Assignment */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Assignment
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Region" value={courier.region?.name || '—'} />
            <Row label="Branch" value={courier.branch?.name || '—'} />
            <Row label="Region Code" value={courier.region?.code || '—'} />
            <Row label="Branch Code" value={courier.branch?.code || '—'} />
          </dl>
        </div>

        {/* Timeline */}
        <div className="card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Timeline
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Registered" value={formatDate(courier.createdAt)} />
            <Row label="Created By" value={courier.createdById ? 'Staff' : 'System'} />
            {courier.approvedAt && (
              <>
                <Row label="Approved" value={formatDate(courier.approvedAt)} />
                <Row label="Approved By" value={courier.approvedById ? 'Staff' : '—'} />
              </>
            )}
            {courier.rejectedAt && (
              <>
                <Row label="Rejected" value={formatDate(courier.rejectedAt)} />
                <Row label="Rejected By" value={courier.rejectedById ? 'Staff' : '—'} />
              </>
            )}
            {courier.suspendedAt && (
              <>
                <Row label="Suspended" value={formatDate(courier.suspendedAt)} />
                <Row label="Suspended By" value={courier.suspendedById ? 'Staff' : '—'} />
              </>
            )}
            <Row label="Last Updated" value={formatDate(courier.updatedAt)} />
          </dl>
        </div>
      </div>

      {/* Orders section */}
      <div className="card p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Package className="h-4 w-4" /> Orders
        </h2>
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No orders assigned yet</p>
          <p className="text-sm mt-1">
            Orders will appear here once the Orders module is built.
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateCourierModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        courier={courier}
      />

      <ConfirmDialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={handleSuspend}
        title="Suspend Courier"
        message={`Suspend "${courier.name}"? They will be logged out and cannot accept deliveries.`}
        confirmText="Suspend"
        variant="danger"
        loading={suspend.isPending}
      />

      <ConfirmDialog
        open={reactivateOpen}
        onClose={() => setReactivateOpen(false)}
        onConfirm={handleReactivate}
        title="Reactivate Courier"
        message={`Reactivate "${courier.name}"? They will be able to accept deliveries again.`}
        confirmText="Reactivate"
        variant="primary"
        loading={reactivate.isPending}
      />

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRejectOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Courier</h3>
            <label className="label">Reason for rejection *</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="e.g. Missing documents, invalid license..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              minLength={3}
              maxLength={500}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">{rejectReason.length}/500</p>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="secondary" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={reject.isPending}
                disabled={rejectReason.trim().length < 3}
              >
                Reject Courier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value}</dd>
    </div>
  );
}

function DocThumb({ label, url }: { label: string; url: string | null | undefined }) {
  const src = imageSrc(url);
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {src ? (
        <a href={src} target="_blank" rel="noopener noreferrer">
          <img
            src={src}
            alt={label}
            className="h-24 w-full object-cover rounded-md border border-gray-200 hover:opacity-80"
          />
        </a>
      ) : (
        <div className="h-24 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
          Not uploaded
        </div>
      )}
    </div>
  );
}
