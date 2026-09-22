import { useMemo, useState } from 'react';
import {
  Search,
  Landmark,
  UserCog,
  KeyRound,
  Ban,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CreateStaffModal } from '@/components/staff/CreateStaffModal';
import { ResetStaffPasswordModal } from '@/components/staff/ResetStaffPasswordModal';
import {
  useStaff,
  useSuspendStaff,
  useReactivateStaff,
} from '@/hooks/useStaff';
import { useRegions } from '@/hooks/useRegions';
import { useAuthStore } from '@/lib/auth';
import { StaffRole, type Staff as StaffType } from '@/types';

type RoleType = 'REGIONAL_ADMIN' | 'BRANCH_MANAGER';

const ROLE_LABELS: Record<StaffRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  REGIONAL_ADMIN: 'Regional Admin',
  BRANCH_MANAGER: 'Branch Manager',
};

const ROLE_COLORS: Record<StaffRole, string> = {
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  REGIONAL_ADMIN: 'bg-blue-50 text-blue-700 border border-blue-200',
  BRANCH_MANAGER: 'bg-green-50 text-green-700 border border-green-200',
};

export function Staff() {
  const me = useAuthStore((s) => s.account);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<RoleType | null>(null);
  const [resetTarget, setResetTarget] = useState<StaffType | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<StaffType | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<StaffType | null>(null);

  const { data, isLoading } = useStaff({
    search: search || undefined,
    role: (roleFilter as StaffRole) || undefined,
    regionId: regionFilter || undefined,
    limit: 100,
  });

  const { data: regions = [] } = useRegions();
  const suspend = useSuspendStaff();
  const reactivate = useReactivateStaff();

  const staffList = data?.data || [];

  const regionMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((r) => { map[r.id] = r.name; });
    return map;
  }, [regions]);

  const openCreate = (role: RoleType) => {
    setCreateRole(role);
    setCreateOpen(true);
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
        title="Staff"
        description="Manage Regional Admins and Branch Managers"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openCreate('BRANCH_MANAGER')}>
              <UserCog className="h-4 w-4" /> Branch Manager
            </Button>
            <Button onClick={() => openCreate('REGIONAL_ADMIN')}>
              <Landmark className="h-4 w-4" /> Regional Admin
            </Button>
          </div>
        }
      />

      <div className="card">
        {/* Filters */}
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
            className="input max-w-[200px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="REGIONAL_ADMIN">Regional Admin</option>
            <option value="BRANCH_MANAGER">Branch Manager</option>
          </select>

          <select
            className="input max-w-[200px]"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {staffList.length} of {data?.total ?? 0}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : staffList.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff found"
            description="Create your first Regional Admin to delegate region management."
            action={
              <Button onClick={() => openCreate('REGIONAL_ADMIN')}>
                <Landmark className="h-4 w-4" /> Create Regional Admin
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => {
                  const isSuperAdmin = s.role === 'SUPER_ADMIN';
                  const isMe = s.id === me?.id;
                  const canManage = !isSuperAdmin && !isMe;

                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                            {s.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {s.name || '(no name)'}
                              {isMe && (
                                <span className="ml-2 text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">
                                  you
                                </span>
                              )}
                            </p>
                            {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[s.role]}`}>
                          {s.role === 'SUPER_ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                          {ROLE_LABELS[s.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {s.regionId ? regionMap[s.regionId] || '—' : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {s.isActive ? (
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
                        {canManage && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setResetTarget(s)}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              title="Reset password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            {s.isActive ? (
                              <button
                                onClick={() => setSuspendTarget(s)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Suspend"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setReactivateTarget(s)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Reactivate"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateStaffModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateRole(null);
        }}
        role={createRole}
      />

      <ResetStaffPasswordModal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        staff={resetTarget}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title="Suspend Staff"
        message={`Suspend "${suspendTarget?.name}"? They will be logged out and unable to log in until reactivated.`}
        confirmText="Suspend"
        variant="danger"
        loading={suspend.isPending}
      />

      <ConfirmDialog
        open={!!reactivateTarget}
        onClose={() => setReactivateTarget(null)}
        onConfirm={handleReactivate}
        title="Reactivate Staff"
        message={`Reactivate "${reactivateTarget?.name}"? They will be able to log in again.`}
        confirmText="Reactivate"
        variant="primary"
        loading={reactivate.isPending}
      />
    </div>
  );
}
