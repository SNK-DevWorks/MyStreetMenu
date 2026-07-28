import React from 'react';
import Link from 'next/link';

export interface VendorRow {
  shop: string;
  joined: string;
  status: 'Active' | 'Inactive' | string;
}

const defaultVendors: VendorRow[] = [
  { shop: 'Burger Corner', joined: 'Today', status: 'Active' },
  { shop: 'Tea Time', joined: 'Yesterday', status: 'Active' },
  { shop: 'Roll House', joined: '2 Days Ago', status: 'Inactive' },
];

export function RecentVendorsTable({ vendors = defaultVendors }: { vendors?: VendorRow[] }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#1f114a] mb-4">Recent Vendors</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="border-b border-gray-200/80 text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-2">Shop</th>
                <th className="py-2.5 px-2">Joined</th>
                <th className="py-2.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {vendors.map((vendor, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-2 text-[#1f114a] font-semibold">{vendor.shop}</td>
                  <td className="py-3 px-2 text-gray-500">{vendor.joined}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        vendor.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-2 text-right">
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline transition-colors"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

export default RecentVendorsTable;
