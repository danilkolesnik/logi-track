export interface AccessRequest {
  id: string;
  email: string;
  company_name: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  client_id: string;
  tracking_number: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  origin: string;
  destination: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  shipment_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ShipmentTimeline {
  id: string;
  shipment_id: string;
  status: string;
  timestamp: string;
  notes: string | null;
  location: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
