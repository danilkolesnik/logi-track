import type { Shipment, Document, ShipmentTimeline } from '@/types/api';

export const mockShipments: Shipment[] = [
  {
    id: '1',
    client_id: 'mock-client-id',
    tracking_number: 'TRK-2024-001',
    status: 'in_transit',
    origin: 'New York, USA',
    destination: 'Los Angeles, USA',
    estimated_delivery: '2024-02-05',
    actual_delivery: null,
    created_at: '2024-01-28T10:00:00Z',
    updated_at: '2024-01-29T08:30:00Z',
  },
  {
    id: '2',
    client_id: 'mock-client-id',
    tracking_number: 'TRK-2024-002',
    status: 'delivered',
    origin: 'Chicago, USA',
    destination: 'Miami, USA',
    estimated_delivery: '2024-01-25',
    actual_delivery: '2024-01-24',
    created_at: '2024-01-20T14:00:00Z',
    updated_at: '2024-01-24T16:45:00Z',
  },
  {
    id: '3',
    client_id: 'mock-client-id',
    tracking_number: 'TRK-2024-003',
    status: 'pending',
    origin: 'Seattle, USA',
    destination: 'Portland, USA',
    estimated_delivery: '2024-02-10',
    actual_delivery: null,
    created_at: '2024-01-29T09:15:00Z',
    updated_at: '2024-01-29T09:15:00Z',
  },
  {
    id: '4',
    client_id: 'mock-client-id',
    tracking_number: 'TRK-2024-004',
    status: 'in_transit',
    origin: 'Boston, USA',
    destination: 'Atlanta, USA',
    estimated_delivery: '2024-02-02',
    actual_delivery: null,
    created_at: '2024-01-25T11:30:00Z',
    updated_at: '2024-01-28T15:20:00Z',
  },
  {
    id: '5',
    client_id: 'mock-client-id',
    tracking_number: 'TRK-2024-005',
    status: 'delivered',
    origin: 'Denver, USA',
    destination: 'Phoenix, USA',
    estimated_delivery: '2024-01-22',
    actual_delivery: '2024-01-22',
    created_at: '2024-01-18T08:00:00Z',
    updated_at: '2024-01-22T12:00:00Z',
  },
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    shipment_id: '1',
    file_name: 'invoice_TRK-2024-001.pdf',
    file_url: '/documents/invoice_TRK-2024-001.pdf',
    file_type: 'application/pdf',
    file_size: 245760,
    uploaded_at: '2024-01-28T10:30:00Z',
  },
  {
    id: '2',
    shipment_id: '1',
    file_name: 'packing_list_TRK-2024-001.pdf',
    file_url: '/documents/packing_list_TRK-2024-001.pdf',
    file_type: 'application/pdf',
    file_size: 128000,
    uploaded_at: '2024-01-28T10:35:00Z',
  },
  {
    id: '3',
    shipment_id: '2',
    file_name: 'invoice_TRK-2024-002.pdf',
    file_url: '/documents/invoice_TRK-2024-002.pdf',
    file_type: 'application/pdf',
    file_size: 189440,
    uploaded_at: '2024-01-20T14:15:00Z',
  },
];

export const mockTimeline: ShipmentTimeline[] = [
  { id: 't1', shipment_id: '1', status: 'created', timestamp: '2024-01-28T10:00:00Z', notes: 'Shipment created', location: 'New York, USA' },
  { id: 't2', shipment_id: '1', status: 'in_transit', timestamp: '2024-01-29T08:30:00Z', notes: 'Departed origin', location: 'New York, USA' },
  { id: 't3', shipment_id: '2', status: 'created', timestamp: '2024-01-20T14:00:00Z', notes: 'Shipment created', location: 'Chicago, USA' },
  { id: 't4', shipment_id: '2', status: 'in_transit', timestamp: '2024-01-22T09:00:00Z', notes: 'In transit', location: null },
  { id: 't5', shipment_id: '2', status: 'delivered', timestamp: '2024-01-24T16:45:00Z', notes: 'Delivered', location: 'Miami, USA' },
  { id: 't6', shipment_id: '3', status: 'pending', timestamp: '2024-01-29T09:15:00Z', notes: 'Awaiting pickup', location: 'Seattle, USA' },
  { id: 't7', shipment_id: '4', status: 'created', timestamp: '2024-01-25T11:30:00Z', notes: 'Shipment created', location: 'Boston, USA' },
  { id: 't8', shipment_id: '4', status: 'in_transit', timestamp: '2024-01-28T15:20:00Z', notes: 'In transit', location: null },
  { id: 't9', shipment_id: '5', status: 'created', timestamp: '2024-01-18T08:00:00Z', notes: 'Shipment created', location: 'Denver, USA' },
  { id: 't10', shipment_id: '5', status: 'in_transit', timestamp: '2024-01-20T12:00:00Z', notes: 'In transit', location: null },
  { id: 't11', shipment_id: '5', status: 'delivered', timestamp: '2024-01-22T12:00:00Z', notes: 'Delivered', location: 'Phoenix, USA' },
];

export const getDashboardStats = () => {
  const total = mockShipments.length;
  const inTransit = mockShipments.filter((s) => s.status === 'in_transit').length;
  const delivered = mockShipments.filter((s) => s.status === 'delivered').length;
  const pending = mockShipments.filter((s) => s.status === 'pending').length;

  return {
    total,
    inTransit,
    delivered,
    pending,
  };
};

export function getMockShipmentById(id: string): Shipment | undefined {
  return mockShipments.find((s) => s.id === id);
}

export function getMockTimelineByShipmentId(shipmentId: string): ShipmentTimeline[] {
  return mockTimeline
    .filter((t) => t.shipment_id === shipmentId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
