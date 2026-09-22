import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Building2,
  Users,
  Package,
  LogOut,
  Bike,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/regions', label: 'Regions', icon: Map },
  { to: '/branches', label: 'Branches', icon: Building2 },
  { to: '/staff', label: 'Staff', icon: Users },
  { to: '/couriers', label: 'Couriers', icon: Bike },
  { to: '/customers', label: 'Customers', icon: UserCheck },     // ← NEW
  { to: '/orders', label: 'Orders', icon: Package },              // ← NEW (was disabled)
  { to: '/payment-providers', label: 'Payment Providers', icon: CreditCard },
];

export function DashboardLayout() {
  const account = useAuthStore((s) => s.account);
  const { refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {}
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-full">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-700">🚚 Deliver ET</h1>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.disabled ? '#' : item.to}
              end={item.end}
              onClick={(e) => item.disabled && e.preventDefault()}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {account?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {account?.name || 'Staff'}
              </p>
              <p className="text-xs text-gray-500 truncate">{account?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
