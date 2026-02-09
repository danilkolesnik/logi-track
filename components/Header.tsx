'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useIsAdmin } from '@/lib/auth/useIsAdmin';
import { usePrefetchShipments } from '@/lib/store/api/shipmentsApi';
import { usePrefetchAdmin } from '@/lib/store/api/adminApi';
import { useAppSelector } from '@/lib/store/hooks';
import {
  DashboardIcon,
  ShipmentsIcon,
  DocumentsIcon,
  UsersIcon,
  AccessRequestsIcon,
  ImportShipmentsIcon,
} from '@/components/icons';

export interface HeaderProps {
  title?: string;
}

export default function Header({
  title
}: HeaderProps) {
  const user = useAppSelector((state) => state.user.user);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const navLinkClass = (href: string) =>
    `flex items-center gap-2 transition-colors ${isActive(href) ? 'text-primary-600 underline' : 'text-gray-700 hover:text-primary-600'}`;

  const isAdmin = useIsAdmin();
  const prefetchShipments = usePrefetchShipments('getShipments');
  const prefetchAdminUsers = usePrefetchAdmin('getAdminUsers');
  const prefetchAdminShipments = usePrefetchAdmin('getAdminShipments');

  const SignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/auth/signout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login');
      router.refresh();
    } catch (e) {
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login');
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-900">{title ?? 'Logi Track'}</h1>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email ?? 'User'}</span>
              <button
                type="button"
                onClick={SignOut}
                disabled={signingOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {user && (
        <nav className="px-8 pb-4 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/dashboard"
              className={navLinkClass('/dashboard')}
            >
              <DashboardIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <Link
              href="/shipments"
              className={navLinkClass('/shipments')}
              onMouseEnter={() => prefetchShipments()}
            >
              <ShipmentsIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Shipments</span>
            </Link>

            <Link
              href="/documents"
              className={navLinkClass('/documents')}
            >
              <DocumentsIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Documents</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className={navLinkClass('/admin/users')}
                  onMouseEnter={() => prefetchAdminUsers()}
                >
                  <UsersIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Users</span>
                </Link>

                <Link
                  href="/admin/access-requests"
                  className={navLinkClass('/admin/access-requests')}
                >
                  <AccessRequestsIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Access Requests</span>
                </Link>

                <Link
                  href="/admin/shipments"
                  className={navLinkClass('/admin/shipments')}
                  onMouseEnter={() => {
                    prefetchAdminUsers();
                    prefetchAdminShipments();
                  }}
                >
                  <ImportShipmentsIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Import Shipments</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
