import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMockShipmentById, getMockTimelineByShipmentId } from '@/lib/utils/mockData';
import { formatDateUTC, formatDateTimeUTC } from '@/lib/utils/date';
import Header from '@/components/Header';

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = await params;
  const shipment = getMockShipmentById(id);

  if (!shipment) {
    notFound();
  }

  const timeline = getMockTimelineByShipmentId(id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shipment Details" backHref="/shipments" backLabel="Shipments" />

      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/shipments"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-4 inline-block"
          >
            ← Back to Shipments
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mt-2">
            {shipment.tracking_number}
          </h2>
          <p className="text-gray-600 mt-1">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    shipment.status
                  )}`}
                >
                  {shipment.status.replace('_', ' ').toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{shipment.tracking_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Origin</dt>
              <dd className="mt-1 text-sm text-gray-900">{shipment.origin}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Destination</dt>
              <dd className="mt-1 text-sm text-gray-900">{shipment.destination}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Estimated Delivery</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateUTC(shipment.estimated_delivery)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Actual Delivery</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDateUTC(shipment.actual_delivery)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">No timeline events yet.</p>
          ) : (
            <ul className="relative border-l-2 border-gray-200 pl-6 space-y-6">
              {timeline.map((event, index) => (
                <li key={event.id} className="relative">
                  <span
                    className={`absolute -left-[29px] top-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      index === timeline.length - 1 ? 'bg-primary-600' : 'bg-gray-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {event.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDateTimeUTC(event.timestamp)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-600 mt-1">📍 {event.location}</p>
                    )}
                    {event.notes && (
                      <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
