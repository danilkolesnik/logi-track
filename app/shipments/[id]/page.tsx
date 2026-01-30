'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { shipmentsApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, DetailsList } from '@/components/ui';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC, formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { Shipment, ShipmentTimeline } from '@/types/api';

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<ShipmentTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([shipmentsApi.getById(id), shipmentsApi.getTimeline(id)])
      .then(([shipRes, timelineRes]) => {
        if (cancelled) return;
        const ship = shipRes.data;
        const tl = timelineRes.data ?? [];
        if (!ship) {
          setShipment(null);
          setTimeline([]);
        } else {
          setShipment(ship);
          setTimeline(tl);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load shipment');
          setShipment(null);
          setTimeline([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (id !== null && !loading) {
    if (error || !shipment) {
      notFound();
    }
  }

  if (loading || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Shipment Details" backHref="/shipments" backLabel="Shipments" />
        <main className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const DetailsItems = [
    {
      label: 'Status',
      value: (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatusBadgeClass(
            shipment.status
          )}`}
        >
          {shipment.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    { label: 'Tracking Number', value: shipment.tracking_number },
    { label: 'Origin', value: shipment.origin },
    { label: 'Destination', value: shipment.destination },
    {
      label: 'Estimated Delivery',
      value: formatDateUTC(shipment.estimated_delivery),
    },
    {
      label: 'Actual Delivery',
      value: formatDateUTC(shipment.actual_delivery),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shipment Details" backHref="/shipments" backLabel="Shipments" />

      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/shipments"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
          >
            ← Back to Shipments
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mt-2">
            {shipment.tracking_number}
          </h2>
          <p className="text-gray-600 mt-1">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>

        <Card className="p-6 mb-8">
          <CardHeader className="border-b-0 pb-0">
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <DetailsList items={DetailsItems} />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader className="border-b-0 pb-0">
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500">No timeline events yet.</p>
            ) : (
              <ul className="relative border-l-2 border-gray-200 pl-6 space-y-6">
                {timeline.map((event, index) => (
                  <li key={event.id} className="relative">
                    <span
                      className={`absolute -left-[29px] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        index === timeline.length - 1 ? 'bg-primary-600' : 'bg-gray-400'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {event.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDateTimeUTC(event.timestamp)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-600 mt-1">📍 {event.location}</p>
                      )}
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
