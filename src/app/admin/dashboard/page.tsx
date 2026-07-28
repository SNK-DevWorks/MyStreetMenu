import React from 'react';
import { StatCards, RecentVendorsTable, RecentActivity } from '@/features/admin/dashboard';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentVendorsTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
