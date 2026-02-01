'use client';

import Link from 'next/link';
import { useGetShipmentsQuery, usePrefetchShipments } from '@/lib/store/api/shipmentsApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { Shipment } from '@/types/api';

function getDashboardStats(shipments: Shipment[]) {
  const total = shipments.length;
  const inTransit = shipments.filter((s) => s.status === 'in_transit').length;
  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const pending = shipments.filter((s) => s.status === 'pending').length;
  return { total, inTransit, delivered, pending };
}

export default function DashboardPage() {
  const { data: shipments = [], isLoading: loading, isError, error } = useGetShipmentsQuery();
  const prefetchShipments = usePrefetchShipments('getShipments');

  const stats = getDashboardStats(shipments);
  const recentShipments = shipments.slice(0, 5);
  const errorMessage = isError && error && 'message' in error ? String(error.message) : isError ? 'Failed to load shipments' : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      <main className="p-8 max-w-7xl mx-auto">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="bg-primary-100 rounded-full p-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inTransit}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.delivered}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Shipments</CardTitle>
            <Link
              href="/shipments"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              onMouseEnter={() => prefetchShipments()}
            >
              View All →
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading…</div>
            ) : recentShipments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No shipments yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estimated Delivery
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.tracking_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shipment.origin}</div>
                        <div className="text-xs text-gray-500">→ {shipment.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatusBadgeClass(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateUTC(shipment.estimated_delivery)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/shipments/${shipment.id}`}
                          className="text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
