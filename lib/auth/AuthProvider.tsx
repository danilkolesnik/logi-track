'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/lib/store/slices/userSlice';
import { supabase } from '@/lib/supabase/client';
import { isAdmin } from './roles';

const PUBLIC_PATHS = ['/', '/login', '/request-access', '/forgot-password', '/reset-password'];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) return false;
  return true;
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const authCheckedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      authCheckedRef.current = true;
      if (!error && currentUser) {
        dispatch(setUser(currentUser));
      } else {
        dispatch(clearUser());
        if (isProtectedPath(pathname)) {
          router.replace('/login');
        }
      }
    };

    syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session) {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!error && currentUser) {
          dispatch(setUser(currentUser));
        } else {
          dispatch(clearUser());
        }
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!authCheckedRef.current) return;
    if (isProtectedPath(pathname) && !user) {
      router.replace('/login');
      return;
    }
    if (isAdminPath(pathname) && user && !isAdmin(user)) {
      router.replace('/dashboard');
    }
  }, [pathname, user, router]);

  return <>{children}</>;
}
