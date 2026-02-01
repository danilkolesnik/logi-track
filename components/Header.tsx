'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useIsAdmin } from '@/lib/auth/useIsAdmin';
import { usePrefetchShipments } from '@/lib/store/api/shipmentsApi';
import { usePrefetchAdmin } from '@/lib/store/api/adminApi';
import { useAppSelector } from '@/lib/store/hooks';
import axios from 'axios';

export interface HeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export default function Header({
  title,
  backHref,
  backLabel = 'Dashboard'
}: HeaderProps) {
  const user = useAppSelector((state) => state.user.user);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinkBase = 'rounded-md p-2.5 border transition-all group';
  
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const navLinkClass = (href: string) =>
    `${navLinkBase} ${isActive(href) ? 'border-primary-300 bg-primary-50/30' : 'bg-gray-50 border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'}`;

  const navTitleClass = (href: string) =>
    `text-sm font-semibold transition-colors ${isActive(href) ? 'text-primary-600' : 'text-gray-900 group-hover:text-primary-600'}`;

  const isAdmin = useIsAdmin();
  const prefetchShipments = usePrefetchShipments('getShipments');
  const prefetchAdminUsers = usePrefetchAdmin('getAdminUsers');
  const prefetchAdminShipments = usePrefetchAdmin('getAdminShipments');

  const SignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      await axios.post('/auth/signout');
      router.replace('/login');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            <Link
              href="/dashboard"
              className={navLinkClass('/dashboard')}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary-100 rounded p-1.5">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className={navTitleClass('/dashboard')}>Dashboard</h3>
                  <p className="text-[11px] text-gray-500">Overview</p>
                </div>
              </div>
            </Link>

            <Link
              href="/shipments"
              className={navLinkClass('/shipments')}
              onMouseEnter={() => prefetchShipments()}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary-100 rounded p-1.5">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className={navTitleClass('/shipments')}>Shipments</h3>
                  <p className="text-[11px] text-gray-500">View and track</p>
                </div>
              </div>
            </Link>

            <Link
              href="/documents"
              className={navLinkClass('/documents')}
            >
              <div className="flex items-center gap-2">
                <div className="bg-primary-100 rounded p-1.5">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={navTitleClass('/documents')}>Documents</h3>
                  <p className="text-[11px] text-gray-500">View and download</p>
                </div>
              </div>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className={navLinkClass('/admin/users')}
                  onMouseEnter={() => prefetchAdminUsers()}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 rounded p-1.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={navTitleClass('/admin/users')}>Users</h3>
                      <p className="text-[11px] text-gray-500">Manage roles</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/access-requests"
                  className={navLinkClass('/admin/access-requests')}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 rounded p-1.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={navTitleClass('/admin/access-requests')}>Access Requests</h3>
                      <p className="text-[11px] text-gray-500">Approve requests</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/shipments"
                  className={navLinkClass('/admin/shipments')}
                  onMouseEnter={() => {
                    prefetchAdminUsers();
                    prefetchAdminShipments();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-100 rounded p-1.5">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={navTitleClass('/admin/shipments')}>Import Shipments</h3>
                      <p className="text-[11px] text-gray-500">Add or import CSV</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
