import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome, {user.email}!
          </h2>
          <p className="text-gray-600">Your dashboard with shipments and documents will appear here.</p>
        </div>
      </main>
    </div>
  );
}
