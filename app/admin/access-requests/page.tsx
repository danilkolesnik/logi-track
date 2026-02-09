'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIsAdmin } from '@/lib/auth/useIsAdmin';
import { accessRequestsApi } from '@/lib/api';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { getAccessRequestStatusBadgeClass } from '@/lib/helpers';
import { formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import type { AccessRequest } from '@/types/api';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AccessRequestsPage() {
  const isAdmin = useIsAdmin();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getRequests = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    if (!isAdmin) return;
    getRequests();
  }, [getRequests, isAdmin]);

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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Access Requests" />

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="text-sm text-gray-900">
                          {req.email}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {req.company_name}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate" title={req.message ?? ''}>
                          {req.message ?? '—'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccessRequestStatusBadgeClass(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTimeUTC(req.created_at)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
