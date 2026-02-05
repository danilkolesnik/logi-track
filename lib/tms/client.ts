import type { Shipment } from '@/types/api';

export interface TmsShipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDelivery?: string;
  actualDelivery?: string;
  clientEmail?: string;
  clientId?: string;
  updatedAt: string;
}

export interface TmsTimelineEvent {
  shipmentId: string;
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

export interface TmsConfig {
  apiUrl: string;
  apiKey: string;
  timeout?: number;
}

class TmsClient {
  private config: TmsConfig;

  constructor(config: TmsConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  async getShipments(params?: {
    clientId?: string;
    status?: string;
    updatedSince?: string;
  }): Promise<TmsShipment[]> {
    const url = new URL(`${this.config.apiUrl}/shipments`);
    if (params?.clientId) url.searchParams.set('client_id', params.clientId);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.updatedSince) url.searchParams.set('updated_since', params.updatedSince);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TMS API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.shipments || [];
  }

  async getShipment(trackingNumber: string): Promise<TmsShipment | null> {
    const url = new URL(`${this.config.apiUrl}/shipments/${trackingNumber}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TMS API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  async getTimelineEvents(trackingNumber: string): Promise<TmsTimelineEvent[]> {
    const url = new URL(`${this.config.apiUrl}/shipments/${trackingNumber}/timeline`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TMS API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.events || [];
  }
}

export function createTmsClient(): TmsClient | null {
  const apiUrl = process.env.TMS_API_URL;
  const apiKey = process.env.TMS_API_KEY;

  if (!apiUrl || !apiKey) {
    return null;
  }

  return new TmsClient({
    apiUrl,
    apiKey,
    timeout: parseInt(process.env.TMS_API_TIMEOUT || '30000', 10),
  });
}

export default TmsClient;
