'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { shipmentsApi } from '@/lib/api';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC } from '@/lib/utils/date';
import { sortShipments, type ShipmentSortKey, type SortOrder } from '@/lib/utils/shipments-sort';
import type { Shipment } from '@/types/api';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import Header from '@/components/Header';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<{ by: ShipmentSortKey | null; order: SortOrder }>({
    by: null,
    order: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const sortByColumn = (key: ShipmentSortKey) => {
    setSort((prev) => {
      if (prev.by === key) {
        return { by: key, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { by: key, order: 'desc' };
    });
  };

  const filteredAndSortedShipments = useMemo(() => {
    let list = shipments;
    if (statusFilter) {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => {
        const tracking = (s.tracking_number ?? '').toLowerCase();
        const origin = (s.origin ?? '').toLowerCase();
        const destination = (s.destination ?? '').toLowerCase();
        const status = s.status.replace('_', ' ').toLowerCase();
        const estDate = formatDateUTC(s.estimated_delivery).toLowerCase();
        const actualDate = formatDateUTC(s.actual_delivery).toLowerCase();
        return (
          tracking.includes(q) ||
          origin.includes(q) ||
          destination.includes(q) ||
          status.includes(q) ||
          estDate.includes(q) ||
          actualDate.includes(q)
        );
      });
    }
    return sort.by ? sortShipments(list, sort.by, sort.order) : list;
  }, [shipments, statusFilter, searchQuery, sort.by, sort.order]);

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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-4">
          <input
            type="search"
            placeholder="Search shipments…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 w-64 max-w-full"
          />
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Card className="p-0 overflow-hidden">
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading…</div>
            ) : shipments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No shipments found</div>
            ) : filteredAndSortedShipments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No shipments match the filter or search
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onSortClick={() => sortByColumn('tracking_number')}
                      sortOrder={sort.by === 'tracking_number' ? sort.order : null}
                    >
                      Tracking Number
                    </TableHead>
                    <TableHead
                      onSortClick={() => sortByColumn('origin')}
                      sortOrder={sort.by === 'origin' ? sort.order : null}
                    >
                      Route
                    </TableHead>
                    <TableHead
                      onSortClick={() => sortByColumn('status')}
                      sortOrder={sort.by === 'status' ? sort.order : null}
                    >
                      Status
                    </TableHead>
                    <TableHead
                      onSortClick={() => sortByColumn('estimated_delivery')}
                      sortOrder={sort.by === 'estimated_delivery' ? sort.order : null}
                    >
                      Estimated Delivery
                    </TableHead>
                    <TableHead
                      onSortClick={() => sortByColumn('actual_delivery')}
                      sortOrder={sort.by === 'actual_delivery' ? sort.order : null}
                    >
                      Actual Delivery
                    </TableHead>  
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedShipments.map((shipment) => (
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
