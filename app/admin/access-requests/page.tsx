'use client';

import { useState, useEffect } from 'react';
import { accessRequestsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui';
import { getAccessRequestStatusBadgeClass } from '@/lib/helpers';
import { formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { AccessRequest } from '@/types/api';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filter === 'all' ? undefined : filter;
      const res = await accessRequestsApi.getAll(statusParam);
      setRequests(res.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequests();
  }, [filter]);

  const getStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    setError(null);
    try {
      await accessRequestsApi.updateStatus(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Access Requests" backHref="/dashboard" backLabel="Dashboard" />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Access requests</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No requests found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {req.company_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={req.message ?? ''}>
                        {req.message ?? '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessRequestStatusBadgeClass(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTimeUTC(req.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {req.status === 'pending' ? (
                          <span className="flex gap-2 justify-end">
                            <button
                              onClick={() => getStatusChange(req.id, 'approved')}
                              disabled={updatingId === req.id}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              {updatingId === req.id ? '…' : 'Approve'}
                            </button>
                            <button
                              onClick={() => getStatusChange(req.id, 'rejected')}
                              disabled={updatingId === req.id}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
