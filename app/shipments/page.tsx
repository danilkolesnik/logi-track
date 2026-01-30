'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { shipmentsApi } from '@/lib/api';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { Shipment } from '@/types/api';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    shipmentsApi
      .getList()
      .then((res) => {
        if (!cancelled) {
          setShipments(res.data ?? []);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load shipments');
          setShipments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shipments" backHref="/dashboard" backLabel="Dashboard" />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">All Shipments</h2>
          <p className="text-gray-600">View and track all your shipments</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <Card className="p-0 overflow-hidden">
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading…</div>
            ) : shipments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No shipments found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Estimated Delivery</TableHead>
                    <TableHead>Actual Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
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
                      <TableCell className="text-sm text-gray-500">
                        {formatDateUTC(shipment.actual_delivery)}
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
