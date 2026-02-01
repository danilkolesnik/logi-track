'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  type AdminUser,
} from '@/lib/store/api/adminApi';
import { Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';
import { useIsAdmin } from '@/lib/auth/useIsAdmin';
import { USER_ROLES } from '@/lib/auth/roles-options';

export default function AdminUsersPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { data: users = [], isLoading, isError, error } = useGetAdminUsersQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState('user');
  
  const cancelEdit = useCallback(() => setEditingUser(null), []);

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/dashboard');
      return;
    }
    if (isError) {
      toast.error(error && 'message' in error ? String(error.message) : 'Failed to load users', {
        toastId: 'users-load-error',
      });
    }
  }, [isAdmin, router, isError, error]);

  useEffect(() => {
    if (!editingUser) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelEdit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingUser, cancelEdit]);

  const startEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditRole(u.role || 'user');
  };

  const submitEdit = async () => {
    if (!editingUser) return;
    try {
      await updateUser({ id: editingUser.id, role: editRole }).unwrap();
      toast.success('User updated');
      setEditingUser(null);
    } catch (err) {
      toast.error(err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to update user');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Users" backHref="/dashboard" backLabel="Dashboard" />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All users</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user roles</p>
        </div>

        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last sign in</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-sm text-gray-900">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTimeUTC(u.created_at ?? null)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDateTimeUTC(u.last_sign_in_at ?? null)}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {editingUser && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={cancelEdit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
          >
            <div
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="edit-user-title" className="text-lg font-semibold text-gray-900 mb-4">
                Edit user
              </h3>
              <p className="text-sm text-gray-600 mb-4">{editingUser.email}</p>
              <div className="mb-6">
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {USER_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEdit}
                  disabled={updating || editRole === (editingUser.role || 'user')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
