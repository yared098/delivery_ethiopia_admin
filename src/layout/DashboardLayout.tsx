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
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { StaffRole } from '@/types';
import { ThemeToggle } from '@/components/ui/ThemeToggle';   // ← ADD

interface NavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  roles?: StaffRole[];
}

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  {
    to: '/regions',
    label: 'Regions',
    icon: Map,
    roles: [StaffRole.SUPER_ADMIN],
  },
  {
    to: '/branches',
    label: 'Branches',
    icon: Building2,
    roles: [StaffRole.SUPER_ADMIN, StaffRole.REGIONAL_ADMIN],
  },
  {
    to: '/staff',
    label: 'Staff',
    icon: Users,
    roles: [StaffRole.SUPER_ADMIN, StaffRole.REGIONAL_ADMIN],
  },
  { to: '/couriers', label: 'Couriers', icon: Bike },
  { to: '/customers', label: 'Customers', icon: UserCheck },
  { to: '/orders', label: 'Orders', icon: Package },
  {
    to: '/payment-providers',
    label: 'Payment Providers',
    icon: CreditCard,
    roles: [StaffRole.SUPER_ADMIN],
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: Bell,
    roles: [StaffRole.SUPER_ADMIN, StaffRole.REGIONAL_ADMIN],
  },
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

  const visibleNav = nav.filter((item) => {
    if (!item.roles) return true;
    if (!account?.role) return false;
    return item.roles.includes(account.role);
  });

  const roleLabel =
    {
      SUPER_ADMIN: 'Super Admin',
      REGIONAL_ADMIN: 'Regional Admin',
      BRANCH_MANAGER: 'Branch Manager',
    }[account?.role as string] || account?.role || 'Staff';

  return (
    <div className="flex h-full">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-primary-700 dark:text-primary-400">
            🚚 Deliver ET
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {/* Theme toggle row */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {/* User */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold">
              {account?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-gray-100">
                {account?.name || 'Staff'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {roleLabel}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}