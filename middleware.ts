import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_PATHS = ['/', '/login', '/request-access', '/forgot-password', '/reset-password'];

function isProtectedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value ?? null,
      set: (name: string, value: string, options: object) => {
        response.cookies.set(name, value, options);
      },
      remove: (name: string, _options?: object) => {
        response.cookies.delete(name);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
