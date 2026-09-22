import { useMemo, useState } from 'react';
import {
  Map,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Building2,
  Bike,
  UserCircle2,
} from 'lucide-react';
import { PageHeader } from '@/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RegionFormModal } from '@/components/regions/RegionFormModal';
import { useRegions, useDeleteRegion } from '@/hooks/useRegions';
import type { Region } from '@/types';

export function Regions() {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [deleting, setDeleting] = useState<Region | null>(null);

  const { data: regions = [], isLoading, error } = useRegions();
  const deleteRegion = useDeleteRegion();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return regions;
    return regions.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [regions, search]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (region: Region) => {
    setEditing(region);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteRegion.mutateAsync(deleting.id);
      setDeleting(null);
    } catch {
      // toast handled
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Regions"
        description="Manage Ethiopian regions"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Region
          </Button>
        }
      />

      <div className="card">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search regions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="text-sm text-gray-500 ml-auto">
            {filtered.length} of {regions.length}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} columns={7} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Failed to load regions. Please refresh.
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Map}
            title={search ? 'No regions match your search' : 'No regions yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Create your first region to start building the delivery network.'
            }
            action={
              !search ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Create Region
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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Created By</th>
                  <th className="px-6 py-3 text-right">Staff</th>
                  <th className="px-6 py-3 text-right">Branches</th>
                  <th className="px-6 py-3 text-right">Couriers</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary-50 text-primary-700">
                        {r.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>

                    {/* ─── NEW: Created By ─── */}
                    <td className="px-6 py-4">
                      {r.createdBy ? (
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {r.createdBy.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(r.createdAt)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">system</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {r._count?.staff ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {r._count?.branches ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        <Bike className="h-3.5 w-3.5 text-gray-400" />
                        {r._count?.couriers ?? 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(r)}
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

      <RegionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        region={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Region"
        message={`Delete "${deleting?.name}"? Regions with staff, branches, or couriers cannot be deleted.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteRegion.isPending}
      />
    </div>
  );
}
