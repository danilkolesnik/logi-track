'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/slices/userSlice';
import { supabase } from '@/lib/supabase/client';
import { isAdmin } from './roles';
import { isProtectedPath, isAdminPath, isPublicPath } from '@/lib/utils/paths';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const isLoading = useAppSelector((state) => state.user.loading);
  const authCheckedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      if (isPublicPath(pathname)) {
        authCheckedRef.current = true;
        dispatch(setLoading(false));
        return;
      }

      dispatch(setLoading(true));

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (!mounted) return;

        authCheckedRef.current = true;
        if (!error && session?.user) {
          dispatch(setUser(session.user));
        } else {
          dispatch(clearUser());
          if (isProtectedPath(pathname)) {
            router.replace('/login');
          }
        }
      } catch {
        if (!mounted) return;
        dispatch(clearUser());
        if (isProtectedPath(pathname)) {
          router.replace('/login');
        }
      } finally {
        if (mounted) {
          dispatch(setLoading(false));
        }
      }
    };

    const shouldSync =
      !isPublicPath(pathname) && (!authCheckedRef.current || !user);
    if (shouldSync) {
      syncUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      const currentPath = window.location.pathname;
      if (session?.user) {
        dispatch(setUser(session.user));
        if (event !== 'INITIAL_SESSION' && isAdminPath(currentPath) && !isAdmin(session.user)) {
          // router.replace('/dashboard');
        }
      } else {
        dispatch(clearUser());
        if (event !== 'INITIAL_SESSION' && isProtectedPath(currentPath)) {
          router.replace('/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch, pathname, router, user]);

  useEffect(() => {
    if (!authCheckedRef.current || isLoading) return;
    if (isProtectedPath(pathname) && !user) {
      router.replace('/login');
      return;
    }
    if (isAdminPath(pathname) && user && !isAdmin(user)) {
      // router.replace('/dashboard');
    }
  }, [pathname, user, router, isLoading]);

  if (isLoading && !isPublicPath(pathname)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
