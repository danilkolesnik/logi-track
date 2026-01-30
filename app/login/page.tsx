'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(`error: ${err}`);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Logi Track</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

        <form onSubmit={signIn} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center flex flex-col gap-4">
          <Link
            href="/forgot-password"
            className="text-primary-600 text-sm hover:text-primary-700 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
          <div className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/request-access" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
              Request Access
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
