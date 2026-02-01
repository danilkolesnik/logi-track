import type { User } from '@supabase/supabase-js';

export const ADMIN_ROLE = 'admin';

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = user.app_metadata?.role;
  return role === ADMIN_ROLE;
}
