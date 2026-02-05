import { PUBLIC_PATHS, PUBLIC_API_PATHS } from '@/lib/constants/middleware';

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

export function isPublicApiPath(pathname: string, method: string): boolean {
  if (PUBLIC_API_PATHS.includes(pathname) && method === 'POST') {
    return true;
  }
  return false;
}

export function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api');
}

export function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) return false;
  return true;
}
