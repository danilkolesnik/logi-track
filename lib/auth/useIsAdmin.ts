'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { isAdmin } from './roles';

export function useIsAdmin(): boolean {
  const user = useAppSelector((state) => state.user.user);
  return isAdmin(user);
}
