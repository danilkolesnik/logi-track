'use client';

import Link from 'next/link';
import { useGetShipmentsQuery, usePrefetchShipments } from '@/lib/store/api/shipmentsApi';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import { ShipmentsIcon, InTransitIcon, DeliveredIcon, PendingIcon } from '@/components/icons';
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
                <ShipmentsIcon className="w-6 h-6 text-primary-600" />
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
                <InTransitIcon />
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
                <DeliveredIcon />
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
                <PendingIcon />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estimated Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">{shipment.tracking_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{shipment.origin}</div>
                        <div className="text-xs text-gray-500">→ {shipment.destination}</div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatusBadgeClass(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDateUTC(shipment.estimated_delivery)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <Link
                          href={`/shipments/${shipment.id}`}
                          className="text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
