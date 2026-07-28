'use client';

import React, { useState, useMemo } from 'react';
import {
  SubscriptionOverviewCards,
  SubscriptionFilters,
  SubscriptionTable,
  ManageSubscriptionModal,
  SubscriptionEmptyState,
  SubscriptionItem,
} from '@/features/admin/subscriptions';

const initialSubscriptions: SubscriptionItem[] = [
  {
    id: '1',
    shopName: 'Burger Corner',
    logoEmoji: '🍔',
    currentPlan: 'Free',
    status: 'Active',
    startDate: '01 Jan 2026',
    expiryDate: '—',
  },
  {
    id: '2',
    shopName: 'Tea Time',
    logoEmoji: '☕',
    currentPlan: 'Basic',
    status: 'Active',
    startDate: '20 Jul 2026',
    expiryDate: '20 Aug 2026',
  },
  {
    id: '3',
    shopName: 'Momo Point',
    logoEmoji: '🥟',
    currentPlan: 'Premium',
    status: 'Expired',
    startDate: '10 Jun 2026',
    expiryDate: '10 Jul 2026',
  },
];

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<SubscriptionItem[]>(initialSubscriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('Expiry Date');

  // Modal State
  const [managingSub, setManagingSub] = useState<SubscriptionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSubscriptions = useMemo(() => {
    let result = subscriptions.filter((sub) => {
      const matchesSearch = sub.shopName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesPlan =
        planFilter === 'All' ||
        sub.currentPlan.toLowerCase() === planFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' ||
        sub.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });

    if (sortBy === 'Newest') {
      result = [...result].reverse();
    }

    return result;
  }, [subscriptions, searchQuery, planFilter, statusFilter, sortBy]);

  const handleAction = (actionName: string, item: SubscriptionItem) => {
    if (actionName === 'Manage Plan' || actionName === 'Manage') {
      setManagingSub(item);
      setIsModalOpen(true);
    } else if (actionName === 'Renew Plan') {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'Active' } : s))
      );
    } else if (actionName === 'Cancel Plan') {
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'Cancelled' } : s))
      );
    }
  };

  const handleSaveSubscription = (updated: SubscriptionItem) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <SubscriptionOverviewCards />

      {/* Search & Filters */}
      <SubscriptionFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Subscription Table or Empty State */}
      {filteredSubscriptions.length > 0 ? (
        <SubscriptionTable
          subscriptions={filteredSubscriptions}
          onAction={handleAction}
        />
      ) : (
        <SubscriptionEmptyState />
      )}

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscription={managingSub}
        onSave={handleSaveSubscription}
      />
    </div>
  );
}
