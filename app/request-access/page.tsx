'use client';

import { useState } from 'react';
import Link from 'next/link';
import { accessRequestsApi } from '@/lib/api';

export default function RequestAccessPage() {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await accessRequestsApi.create({
        email,
        company_name: company,
        message: message || null,
      });

      setSubmitted(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Sent!</h2>
            <p className="text-gray-600 mb-8">
              Your access request has been received. We will contact you shortly.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Return to Home
            </Link>
          </div>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="bg-white rounded-xl shadow-2xl p-12 w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Access</h1>
          <p className="text-gray-600">Fill out the form below to request access to the system</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email *
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
            <label htmlFor="company" className="text-sm font-semibold text-gray-700">
              Company Name *
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company name"
              required
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-semibold text-gray-700">
              Additional Information
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe why you need access..."
              rows={4}
              disabled={loading}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y font-inherit"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-primary-600 text-sm hover:text-primary-700 hover:underline transition-colors"
          >
            Already have access? Sign In
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
