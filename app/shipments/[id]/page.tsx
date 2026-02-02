'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toast } from 'react-toastify';
import { shipmentsApi, documentsApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { getShipmentStatusBadgeClass, formatFileSize } from '@/lib/helpers';
import { formatDateUTC, formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import { SHIPMENT_STATUSES, TIMELINE_STATUSES } from '@/lib/constants/shipment-statuses';
import type { Shipment, ShipmentTimeline, Document } from '@/types/api';

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

function loadShipmentAndTimeline(shipmentId: string) {
  return Promise.all([
    shipmentsApi.getById(shipmentId),
    shipmentsApi.getTimeline(shipmentId),
  ]);
}

function getFileIcon(fileType: string, fileName: string) {
  const type = fileType.toLowerCase();
  const name = fileName.toLowerCase();
  
  if (type.includes('pdf') || name.endsWith('.pdf')) {
    return (
      <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) {
    return (
      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type.includes('excel') || type.includes('spreadsheet') || /\.(xlsx|xls)$/i.test(name)) {
    return (
      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type.includes('word') || /\.(docx|doc)$/i.test(name)) {
    return (
      <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [timeline, setTimeline] = useState<ShipmentTimeline[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timelineStatus, setTimelineStatus] = useState<string>('in_transit');
  const [timelineNotes, setTimelineNotes] = useState('');
  const [timelineLocation, setTimelineLocation] = useState('');
  const [timelineSubmitting, setTimelineSubmitting] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('pending');
  const [editOrigin, setEditOrigin] = useState('');
  const [editDestination, setEditDestination] = useState('');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState('');
  const [editActualDelivery, setEditActualDelivery] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setId(p.id);
    });
    return () => {
      cancelled = true;
    };
  }, [params]);

  const getDocuments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await documentsApi.getList();
      const allDocs = res.data ?? [];
      setDocuments(allDocs.filter((doc) => doc.shipment_id === id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    }
  }, [id]);

  const refreshTimeline = async () => {
    if (!id) return;
    try {
      const [, timelineRes] = await loadShipmentAndTimeline(id);
      setTimeline(timelineRes.data ?? []);
      await getDocuments();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh');
    }
  };

  const startEdit = () => {
    if (!shipment) return;
    setEditStatus(shipment.status);
    setEditOrigin(shipment.origin);
    setEditDestination(shipment.destination);
    setEditEstimatedDelivery(shipment.estimated_delivery ?? '');
    setEditActualDelivery(shipment.actual_delivery ?? '');
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      const res = await shipmentsApi.update(id, {
        status: editStatus as Shipment['status'],
        origin: editOrigin.trim(),
        destination: editDestination.trim(),
        estimated_delivery: editEstimatedDelivery.trim() || null,
        actual_delivery: editActualDelivery.trim() || null,
      });
      if (res.error) {
        setEditError(res.error);
        return;
      }
      if (res.data) setShipment(res.data);
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update shipment');
    } finally {
      setEditSubmitting(false);
    }
  };

  const addTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setTimelineError(null);
    setTimelineSubmitting(true);
    try {
      const res = await shipmentsApi.createTimelineEntry(id, {
        status: timelineStatus,
        notes: timelineNotes.trim() || null,
        location: timelineLocation.trim() || null,
      });
      if (res.error) {
        setTimelineError(res.error);
        return;
      }
      setTimelineNotes('');
      setTimelineLocation('');
      refreshTimeline();
    } catch (err) {
      setTimelineError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setTimelineSubmitting(false);
    }
  };

  if (id !== null && !loading) {
    if (error || !shipment) {
      notFound();
    }
  }

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadShipmentAndTimeline(id)
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

  useEffect(() => {
    if (!id || !shipment) return;
    getDocuments();
  }, [id, shipment, getDocuments]);

  if (loading || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Shipment Details"/>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shipment Details"/>

      <main className="p-8 max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <CardHeader className="border-b-0 pb-0 flex flex-row items-center justify-between gap-4">
                <CardTitle>Details</CardTitle>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-600 rounded hover:bg-primary-50"
                  >
                    Edit
                  </button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {isEditing ? (
                  <form onSubmit={submitEdit} className="space-y-4">
                    {editError && (
                      <p className="text-sm text-red-600">{editError}</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="edit-status" className="text-xs font-medium text-gray-600">
                          Status
                        </label>
                        <select
                          id="edit-status"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="rounded border border-gray-300 px-3 py-2 text-sm"
                        >
                          {SHIPMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label htmlFor="edit-origin" className="text-xs font-medium text-gray-600">
                          Origin
                        </label>
                        <input
                          id="edit-origin"
                          type="text"
                          value={editOrigin}
                          onChange={(e) => setEditOrigin(e.target.value)}
                          required
                          className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label htmlFor="edit-destination" className="text-xs font-medium text-gray-600">
                          Destination
                        </label>
                        <input
                          id="edit-destination"
                          type="text"
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          required
                          className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="edit-estimated" className="text-xs font-medium text-gray-600">
                          Estimated Delivery
                        </label>
                        <input
                          id="edit-estimated"
                          type="date"
                          value={editEstimatedDelivery}
                          onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                          className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="edit-actual" className="text-xs font-medium text-gray-600">
                          Actual Delivery
                        </label>
                        <input
                          id="edit-actual"
                          type="date"
                          value={editActualDelivery}
                          onChange={(e) => setEditActualDelivery(e.target.value)}
                          className="rounded border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 disabled:opacity-50"
                      >
                        {editSubmitting ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={editSubmitting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatusBadgeClass(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{shipment.tracking_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Origin</dt>
                      <dd className="mt-1 text-sm text-gray-900">{shipment.origin}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Destination</dt>
                      <dd className="mt-1 text-sm text-gray-900">{shipment.destination}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estimated Delivery</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDateUTC(shipment.estimated_delivery)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDateUTC(shipment.actual_delivery)}</dd>
                    </div>
                  </dl>
                )}
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="border-b-0 pb-0">
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <form onSubmit={addTimelineEvent} className="flex flex-wrap gap-3 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="timeline-status" className="text-xs font-medium text-gray-600">
                      Status
                    </label>
                    <select
                      id="timeline-status"
                      value={timelineStatus}
                      onChange={(e) => setTimelineStatus(e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2 text-sm min-w-[140px]"
                    >
                      {TIMELINE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="timeline-location" className="text-xs font-medium text-gray-600">
                      Location
                    </label>
                    <input
                      id="timeline-location"
                      type="text"
                      value={timelineLocation}
                      onChange={(e) => setTimelineLocation(e.target.value)}
                      placeholder="Optional"
                      className="rounded border border-gray-300 px-3 py-2 text-sm min-w-[160px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <label htmlFor="timeline-notes" className="text-xs font-medium text-gray-600">
                      Notes
                    </label>
                    <input
                      id="timeline-notes"
                      type="text"
                      value={timelineNotes}
                      onChange={(e) => setTimelineNotes(e.target.value)}
                      placeholder="Optional"
                      className="rounded border border-gray-300 px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={timelineSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 disabled:opacity-50"
                  >
                    {timelineSubmitting ? 'Adding…' : 'Add event'}
                  </button>
                </form>
                {timelineError && (
                  <p className="text-sm text-red-600">{timelineError}</p>
                )}
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
          </div>

          <div className="lg:col-span-1 flex h-full">
            <Card className="p-6 sticky top-6 w-full">
              <CardHeader className="border-b-0 pb-0 flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Link
                  href="/documents"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  All →
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents for this shipment.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    {documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
                      >
                        <div className="mb-2">
                          {getFileIcon(doc.file_type, doc.file_name)}
                        </div>
                        <p className="text-xs font-medium text-gray-900 text-center mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {doc.file_name}
                        </p>
                        <p className="text-[10px] text-gray-500 text-center">
                          {formatDateTimeUTC(doc.uploaded_at)}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
