'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/lib/store/slices/userSlice';
import { supabase } from '@/lib/supabase/client';

const PUBLIC_PATHS = ['/', '/login', '/request-access', '/forgot-password', '/reset-password'];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) return false;
  return true;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(clearUser());
        if (isProtectedPath(pathname)) {
          router.replace('/login');
          return;
        }
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, dispatch]);

  return <>{children}</>;
}
