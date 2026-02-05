import type { TmsShipment, TmsTimelineEvent } from './client';
import type { Shipment, ShipmentTimeline } from '@/types/api';

export function mapTmsShipmentToShipment(
  tmsShipment: TmsShipment,
  clientId: string
): Omit<Shipment, 'id' | 'created_at' | 'updated_at'> {
  return {
    client_id: clientId,
    tracking_number: tmsShipment.trackingNumber,
    origin: tmsShipment.origin,
    destination: tmsShipment.destination,
    status: tmsShipment.status,
    estimated_delivery: tmsShipment.estimatedDelivery || null,
    actual_delivery: tmsShipment.actualDelivery || null,
  };
}

export function mapTmsTimelineToTimeline(
  tmsEvent: TmsTimelineEvent,
  shipmentId: string
): Omit<ShipmentTimeline, 'id'> {
  return {
    shipment_id: shipmentId,
    status: tmsEvent.status,
    timestamp: tmsEvent.timestamp,
    location: tmsEvent.location || null,
    notes: tmsEvent.notes || null,
  };
}

export function normalizeTmsStatus(status: string): Shipment['status'] {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  const validStatuses: Shipment['status'][] = ['pending', 'in_transit', 'delivered', 'cancelled'];
  
  if (validStatuses.includes(normalized as Shipment['status'])) {
    return normalized as Shipment['status'];
  }
  
  return 'pending';
}
