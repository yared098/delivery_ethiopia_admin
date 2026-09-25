import { useState } from 'react';
import { PageHeader } from '@/layout/PageHeader';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import {
  NotificationFilters,
  type FilterState,
} from '@/components/notifications/NotificationFilters';

export function NotificationsHistory() {
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(1);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Notification History"
        subtitle="Every push ever sent — with filters and search."
      />

      <NotificationFilters
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onReset={() => {
          setFilters({});
          setPage(1);
        }}
      />

      <NotificationsList
        query={{ ...filters, page, limit: 20 }}
        onPageChange={setPage}
      />
    </div>
  );
}