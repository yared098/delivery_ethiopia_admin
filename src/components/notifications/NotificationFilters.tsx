import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type {
  AccountType,
  NotificationType,
} from '@/hooks/useNotifications';

export type FilterState = {
  accountType?: AccountType;
  type?: NotificationType;
  unread?: boolean;
  search?: string;
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
};

const ACCOUNT_TABS: { value?: AccountType; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'COURIER', label: 'Couriers' },
  { value: 'STAFF', label: 'Staff' },
];

export function NotificationFilters({ value, onChange, onReset }: Props) {
  const hasFilters =
    !!value.accountType ||
    !!value.type ||
    value.unread === true ||
    !!value.search;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Account type tabs */}
      <div className="inline-flex p-1 bg-gray-100 rounded-lg">
        {ACCOUNT_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange({ ...value, accountType: tab.value })}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
              value.accountType === tab.value
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={value.search ?? ''}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search title or body…"
          className="pl-9"
        />
      </div>

      {/* Unread toggle */}
      <button
        type="button"
        onClick={() =>
          onChange({ ...value, unread: value.unread ? undefined : true })
        }
        className={cn(
          'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
          value.unread
            ? 'border-primary-500 bg-primary-50 text-primary-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
      >
        ● Unread only
      </button>

      {/* Reset */}
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  );
}