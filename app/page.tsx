import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Logi Track</h1>
        <p className="text-xl md:text-2xl mb-10 opacity-95">
          Logistics tracking and shipment management system
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white text-primary-600 rounded-lg font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign In
          </Link>
          <Link
            href="/request-access"
            className="px-8 py-3.5 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg transition-all hover:bg-white hover:text-primary-600"
          >
            Request Access
          </Link>
        </div>
      </div>
    </main>
    </>
  );
}
