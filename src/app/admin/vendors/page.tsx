'use client';

import React, { useState, useMemo } from 'react';
import {
  VendorFilters,
  VendorTable,
  VendorDetailsDrawer,
  EditVendorModal,
  EmptyState,
  Vendor,
} from '@/features/admin/vendors';

const initialVendors: Vendor[] = [
  {
    id: '1',
    logoEmoji: '🍔',
    shopName: 'Burger Corner',
    owner: 'Rahul Das',
    phone: '+91 98765 43210',
    location: 'Kolkata',
    status: 'Active',
    joined: '12 Jul',
  },
  {
    id: '2',
    logoEmoji: '☕',
    shopName: 'Tea Time',
    owner: 'Anit Sharma',
    phone: '+91 98123 45678',
    location: 'Kolkata',
    status: 'Active',
    joined: '11 Jul',
  },
  {
    id: '3',
    logoEmoji: '🌯',
    shopName: 'Roll House',
    owner: 'Vikram Singh',
    phone: '+91 97890 12345',
    location: 'Mumbai',
    status: 'Inactive',
    joined: '10 Jul',
  },
  {
    id: '4',
    logoEmoji: '🍕',
    shopName: 'Pizza Hub',
    owner: 'Sneha Roy',
    phone: '+91 96543 21098',
    location: 'Delhi',
    status: 'Active',
    joined: '09 Jul',
  },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Details Drawer State
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Modal State
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const filteredVendors = useMemo(() => {
    let result = vendors.filter((v) => {
      const matchesSearch =
        v.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || v.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'Name') {
      result = [...result].sort((a, b) => a.shopName.localeCompare(b.shopName));
    } else if (sortBy === 'Oldest') {
      result = [...result].reverse();
    }

    return result;
  }, [vendors, searchQuery, statusFilter, sortBy]);

  const handleAction = (actionName: string, vendor: Vendor) => {
    if (actionName === 'View Details') {
      setSelectedVendor(vendor);
      setIsDrawerOpen(true);
    } else if (actionName === 'Edit Vendor') {
      setEditingVendor(vendor);
      setIsEditModalOpen(true);
    } else if (actionName === 'Activate') {
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'Active' } : v))
      );
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor((prev) => (prev ? { ...prev, status: 'Active' } : null));
      }
    } else if (actionName === 'Deactivate') {
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'Inactive' } : v))
      );
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor((prev) => (prev ? { ...prev, status: 'Inactive' } : null));
      }
    } else if (actionName === 'Delete Vendor') {
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
      if (selectedVendor?.id === vendor.id) {
        setIsDrawerOpen(false);
        setSelectedVendor(null);
      }
    }
  };

  const handleSaveEditedVendor = (updatedVendor: Vendor) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );
    if (selectedVendor?.id === updatedVendor.id) {
      setSelectedVendor(updatedVendor);
    }
  };

  return (
    <div className="space-y-6">
      <VendorFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {filteredVendors.length > 0 ? (
        <VendorTable vendors={filteredVendors} onAction={handleAction} />
      ) : (
        <EmptyState />
      )}

      {/* Slide-over Drawer for Vendor Details */}
      <VendorDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        vendor={selectedVendor}
        onAction={handleAction}
      />

      {/* Modal for Editing Vendor */}
      <EditVendorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vendor={editingVendor}
        onSave={handleSaveEditedVendor}
      />
    </div>
  );
}
