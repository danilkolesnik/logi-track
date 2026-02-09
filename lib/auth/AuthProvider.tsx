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
      
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      authCheckedRef.current = true;
      dispatch(setLoading(false));
      
      if (!error && currentUser) {
        dispatch(setUser(currentUser));
      } else {
        dispatch(clearUser());
        if (isProtectedPath(pathname)) {
          router.replace('/login');
        }
      }
    };

    if (!authCheckedRef.current) {
      syncUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const currentPath = window.location.pathname;
      if (session) {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!error && currentUser) {
          dispatch(setUser(currentUser));
          if (event !== 'INITIAL_SESSION' && isAdminPath(currentPath) && !isAdmin(currentUser)) {
            // router.replace('/dashboard');
          }
        } else {
          dispatch(clearUser());
          if (event !== 'INITIAL_SESSION' && isProtectedPath(currentPath)) {
            router.replace('/login');
          }
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
  }, [dispatch, pathname, router]);

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
