import { Map, Building2, Users, Bike } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/layout/PageHeader';
import { api } from '@/lib/api';
import type { Region } from '@/types';

export function Dashboard() {
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.get<Region[]>('/admin/regions').then((r) => r.data),
  });

  const totalBranches = regions.reduce((s, r) => s + (r._count?.branches || 0), 0);
  const totalStaff = regions.reduce((s, r) => s + (r._count?.staff || 0), 0);
  const totalCouriers = regions.reduce((s, r) => s + (r._count?.couriers || 0), 0);

  const stats = [
    { label: 'Regions', value: regions.length, icon: Map, color: 'bg-blue-500' },
    { label: 'Branches', value: totalBranches, icon: Building2, color: 'bg-green-500' },
    { label: 'Staff', value: totalStaff, icon: Users, color: 'bg-purple-500' },
    { label: 'Couriers', value: totalCouriers, icon: Bike, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" description="System overview" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={`${s.color} p-3 rounded-lg text-white`}>
                <s.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Regions Overview</h2>
        {regions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No regions yet. Create your first region from the Regions page.
          </p>
        ) : (
          <div className="space-y-2">
            {regions.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {r.code}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {r._count?.staff || 0} staff · {r._count?.branches || 0} branches · {r._count?.couriers || 0} couriers
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
