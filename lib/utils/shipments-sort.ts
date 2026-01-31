import type { Shipment } from '@/types/api';

export type ShipmentSortKey = 'tracking_number' | 'origin' | 'status' | 'estimated_delivery' | 'actual_delivery';
export type SortOrder = 'asc' | 'desc';

export function sortShipments(data: Shipment[], key: ShipmentSortKey, order: SortOrder): Shipment[] {
  return [...data].sort((a, b) => {
    let aVal: string | null;
    let bVal: string | null;
    switch (key) {
      case 'tracking_number':
        aVal = a.tracking_number;
        bVal = b.tracking_number;
        break;
      case 'origin':
        aVal = `${a.origin} ${a.destination}`;
        bVal = `${b.origin} ${b.destination}`;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'estimated_delivery':
      case 'actual_delivery':
        aVal = a[key] ?? '';
        bVal = b[key] ?? '';
        break;
      default:
        return 0;
    }
    const cmp = (aVal ?? '') < (bVal ?? '') ? -1 : (aVal ?? '') > (bVal ?? '') ? 1 : 0;
    return order === 'asc' ? cmp : -cmp;
  });
}
