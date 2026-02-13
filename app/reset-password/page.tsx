'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Image src="/images/logo/logo.png" alt="Logo" width={80} height={80} />
              <h2 className="text-2xl font-bold text-gray-900">Password Updated</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Your password has been reset. Redirecting to sign in...
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Image src="/images/logo/logo.png" alt="Logo" width={80} height={80} />
            <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
          </div>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-primary-600 text-sm hover:text-primary-700 hover:underline transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
