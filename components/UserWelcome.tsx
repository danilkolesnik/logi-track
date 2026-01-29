'use client';

import { useAppSelector } from '@/lib/store/hooks';

export default function UserWelcome() {
  const user = useAppSelector((state) => state.user.user);
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Welcome back, {user?.email ?? 'User'}!
      </h2>
      <p className="text-gray-600">Here&apos;s an overview of your shipments</p>
    </div>
  );
}
