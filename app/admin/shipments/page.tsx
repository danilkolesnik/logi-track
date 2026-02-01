'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useIsAdmin } from '@/lib/auth/useIsAdmin';
import {
  useGetAdminUsersQuery,
  useGetAdminShipmentsQuery,
  useCreateShipmentMutation,
  useImportShipmentsCsvMutation,
  type AdminUser,
} from '@/lib/store/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { getShipmentStatusBadgeClass } from '@/lib/helpers';
import { formatDateUTC } from '@/lib/utils/date';
import Header from '@/components/Header';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SAMPLE_CSV = `tracking_number,origin,destination,status,estimated_delivery,actual_delivery
TRK-001,Warehouse A,Client B,pending,2025-02-15,
TRK-002,Port X,City Y,in_transit,2025-02-10,
TRK-003,Factory 1,Store 2,delivered,2025-01-28,2025-01-27`;

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: string }).message);
  if (err && typeof err === 'object' && 'data' in err && (err as { data?: { error?: string } }).data?.error)
    return String((err as { data: { error: string } }).data.error);
  return 'Something went wrong';
}

export default function AdminShipmentsPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [formClientId, setFormClientId] = useState('');
  const [formTracking, setFormTracking] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formStatus, setFormStatus] = useState('pending');
  const [formEstDelivery, setFormEstDelivery] = useState('');
  const [formActualDelivery, setFormActualDelivery] = useState('');

  const [importClientId, setImportClientId] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);

  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery();
  const { data: shipments = [], isLoading: shipmentsLoading, isError: shipmentsError, error: shipmentsErrorData } = useGetAdminShipmentsQuery();
  const [createShipment, { isLoading: formSubmitting }] = useCreateShipmentMutation();
  const [importShipmentsCsv, { isLoading: importSubmitting }] = useImportShipmentsCsvMutation();

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
    if (shipmentsError) toast.error(getErrorMessage(shipmentsErrorData), { toastId: 'shipments-load-error' });
  }, [shipmentsError, shipmentsErrorData, isAdmin, router]);

  const clearForm = () => {
    setFormTracking('');
    setFormOrigin('');
    setFormDestination('');
    setFormStatus('pending');
    setFormEstDelivery('');
    setFormActualDelivery('');
  };

  const addShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId) {
      toast.error('Select a client');
      return;
    }
    try {
      await createShipment({
        client_id: formClientId,
        tracking_number: formTracking.trim(),
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        status: formStatus,
        estimated_delivery: formEstDelivery || null,
        actual_delivery: formActualDelivery || null,
      }).unwrap();
      toast.success('Shipment added.');
      clearForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const importCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importClientId) {
      toast.error('Select a client for import');
      return;
    }
    if (!importFile || importFile.size === 0) {
      toast.error('Select a CSV file');
      return;
    }
    try {
      const res = await importShipmentsCsv({ client_id: importClientId, file: importFile }).unwrap();
      const count = res.data?.imported ?? 0;
      toast.success(`Imported ${count} shipment(s).`);
      setImportFile(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const downloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return null;

  const getClientEmail = (clientId: string) =>
    users.find((u) => u.id === clientId)?.email ?? clientId.slice(0, 8) + '…';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin: Shipments" backHref="/dashboard" backLabel="Dashboard" />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addShipment} className="flex flex-col gap-4 max-w-xl p-[20px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select client</option>
                    {usersLoading ? (
                      <option value="" disabled>Loading…</option>
                    ) : (
                      users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking number *
                    </label>
                    <input
                      type="text"
                      value={formTracking}
                      onChange={(e) => setFormTracking(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origin *
                    </label>
                    <input
                      type="text"
                      value={formOrigin}
                      onChange={(e) => setFormOrigin(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination *
                    </label>
                    <input
                      type="text"
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated delivery
                    </label>
                    <input
                      type="date"
                      value={formEstDelivery}
                      onChange={(e) => setFormEstDelivery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual delivery
                    </label>
                    <input
                      type="date"
                      value={formActualDelivery}
                      onChange={(e) => setFormActualDelivery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 w-fit"
                >
                  {formSubmitting ? 'Adding…' : 'Add shipment'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import from CSV</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Required columns: tracking_number, origin, destination. Optional: status,
                estimated_delivery, actual_delivery. All rows will be assigned to the selected
                client.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4 p-[20px] ">
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Download sample CSV
                </button>
              </div>
              <form onSubmit={importCsv} className="flex flex-col gap-4 max-w-xl p-[20px]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client for all rows *
                  </label>
                  <select
                    value={importClientId}
                    onChange={(e) => setImportClientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select client</option>
                    {usersLoading ? (
                      <option value="" disabled>Loading…</option>
                    ) : (
                      users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSV file *
                  </label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={importSubmitting || !importFile}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 w-fit"
                >
                  {importSubmitting ? 'Importing…' : 'Import CSV'}
                </button>
              </form>
            </CardContent>
          </Card>

          <Card className="p-0 overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle>All shipments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {shipmentsLoading ? (
                <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
                  <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  Loading…
                </div>
              ) : shipments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No shipments yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tracking
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Route
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Est. / Actual
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shipments.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {s.tracking_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getClientEmail(s.client_id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {s.origin} → {s.destination}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShipmentStatusBadgeClass(
                                s.status
                              )}`}
                            >
                              {s.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateUTC(s.estimated_delivery)} /{' '}
                            {formatDateUTC(s.actual_delivery)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <Link
                              href={`/shipments/${s.id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
