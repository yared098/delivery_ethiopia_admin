import { useMemo, useState } from 'react';
import { Building2, Plus, Search, Edit2, Trash2, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BranchFormModal } from '@/components/branches/BranchFormModal';
import { useBranches, useDeleteBranch } from '@/hooks/useBranches';
import { useRegions } from '@/hooks/useRegions';
import { useAuthStore } from '@/lib/auth';
import type { Branch, Role } from '@/types';

export function Branches() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<Branch | null>(null);

  const { data: regions = [] } = useRegions();
  const { data: branches = [], isLoading } = useBranches({
    regionId: regionFilter || undefined,
  });
  const deleteBranch = useDeleteBranch();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.city && b.city.toLowerCase().includes(q)),
    );
  }, [branches, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteBranch.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // toast handled
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Branches"
        description="Manage branches / cities in each region"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Branch
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
              placeholder="Search by name, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          <select
            className="input max-w-[200px]"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500 ml-auto">
            {filtered.length} of {branches.length}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={search || regionFilter ? 'No branches match your filters' : 'No branches yet'}
            description={
              search || regionFilter
                ? 'Try a different filter.'
                : 'Create your first branch to start receiving packages.'
            }
            action={
              !search && !regionFilter ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Create Branch
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Branch</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Users</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 text-primary-700">
                        {b.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{b.name}</p>
                      {b.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {b.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.region ? `${b.region.name} (${b.region.code})` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.city || b.woreda || b.address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">
                            {[b.city, b.woreda].filter(Boolean).join(', ') || b.address}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {b._count?.users ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(b)}
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

      {/* Create / Edit modal */}
      <BranchFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        branch={editing}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={`Delete "${deleting?.name}"? Branches with assigned users cannot be deleted.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteBranch.isPending}
      />
    </div>
  );
}
