'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  VendorFilters,
  VendorTable,
  VendorDetailsDrawer,
  EditVendorModal,
  EmptyState,
  Vendor,
} from '@/features/admin/vendors';
import {
  getAdminVendorsAction,
  activateVendorAction,
  deactivateVendorAction,
  deleteVendorAction,
  updateVendorDetailsAction,
} from '@/actions/admin/manage-vendor';

const initialVendors: Vendor[] = [
  {
    id: '1',
    logoEmoji: '🍔',
    shopName: 'SNK DevWorks',
    description: 'Best fast food and artisanal burgers in Kolkata',
    owner: 'Rahul Das',
    phone: '7890700156',
    whatsapp: '7890700156',
    location: 'Kolkata',
    mapUrl: 'SNK DEVWORKS',
    status: 'Active',
    joined: '12 Jul',
  },
  {
    id: '2',
    logoEmoji: '☕',
    shopName: 'Tea Time',
    description: 'Authentic handcrafted teas & snacks',
    owner: 'Anit Sharma',
    phone: '+91 98123 45678',
    whatsapp: '+91 98123 45678',
    location: 'Kolkata',
    mapUrl: 'Tea Time Kolkata',
    status: 'Active',
    joined: '11 Jul',
  },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Details Drawer State
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Modal State
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch real vendor data from database
  const loadVendors = useCallback(async () => {
    try {
      const res = await getAdminVendorsAction();
      if (res.success && res.data && res.data.length > 0) {
        const formatted: Vendor[] = res.data.map((item) => {
          const joinedDate = item.userCreatedAt
            ? new Date(item.userCreatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
            : 'Recently';

          return {
            id: item.userId,
            userId: item.userId,
            shopId: item.shopId ?? undefined,
            logoEmoji: item.shopLogoUrl || '🏪',
            shopName: item.shopName || item.userName || 'Unnamed Shop',
            owner: item.userName || 'Vendor Owner',
            email: item.userEmail || '',
            phone: item.shopPhone || item.userPhone || '',
            whatsapp: item.shopWhatsapp || item.shopPhone || item.userPhone || '',
            description: item.shopFoodType || '',
            foodType: item.shopFoodType || '',
            location: item.shopAddress || 'Not set',
            mapUrl: item.shopMapUrl || '',
            status: item.shopIsActive && item.userIsActive ? 'Active' : 'Inactive',
            joined: joinedDate,
          };
        });
        setVendors(formatted);
      }
    } catch {
      // Fall back to initial vendors on error or empty DB
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

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

  const handleAction = async (actionName: string, vendor: Vendor) => {
    const targetUserId = vendor.userId || vendor.id;

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
      await activateVendorAction(targetUserId);
    } else if (actionName === 'Deactivate') {
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, status: 'Inactive' } : v))
      );
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor((prev) => (prev ? { ...prev, status: 'Inactive' } : null));
      }
      await deactivateVendorAction(targetUserId);
    } else if (actionName === 'Delete Vendor') {
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
      if (selectedVendor?.id === vendor.id) {
        setIsDrawerOpen(false);
        setSelectedVendor(null);
      }
      await deleteVendorAction(targetUserId);
    }
  };

  const handleSaveEditedVendor = async (updatedVendor: Vendor) => {
    const targetUserId = updatedVendor.userId || updatedVendor.id;

    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );
    if (selectedVendor?.id === updatedVendor.id) {
      setSelectedVendor(updatedVendor);
    }

    await updateVendorDetailsAction({
      userId: targetUserId,
      owner: updatedVendor.owner,
      phone: updatedVendor.phone,
      shopName: updatedVendor.shopName,
      foodType: updatedVendor.description || updatedVendor.foodType,
      whatsapp: updatedVendor.whatsapp,
      mapUrl: updatedVendor.mapUrl,
      address: updatedVendor.location,
      isActive: updatedVendor.status === 'Active',
    });

    await loadVendors();
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

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-200">
          <div className="h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : filteredVendors.length > 0 ? (
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
