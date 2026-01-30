'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';

export interface HeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  showPublicNav?: boolean;
}

export default function Header({
  title,
  backHref,
  backLabel = 'Dashboard',
  showPublicNav = true,
}: HeaderProps) {
  const user = useAppSelector((state) => state.user.user);

  if (user) {
    return (
      <header className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {backHref && (
            <Link
              href={backHref}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              ← {backLabel}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title ?? 'Logi Track'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email ?? 'User'}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
      <Link
        href="/"
        className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
      >
        Logi Track
      </Link>
      {showPublicNav && (
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/request-access"
            className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Request Access
          </Link>
        </nav>
      )}
    </header>
  );
}
