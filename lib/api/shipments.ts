import apiClient from './client';
import type { Shipment, ShipmentTimeline, ApiResponse } from '@/types/api';

export const shipmentsApi = {
  getList: async (params?: { status?: string; tracking_number?: string }): Promise<ApiResponse<Shipment[]>> => {
    const response = await apiClient.get<ApiResponse<Shipment[]>>('/shipments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Shipment>> => {
    const response = await apiClient.get<ApiResponse<Shipment>>(`/shipments/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    payload: Partial<Pick<Shipment, 'status' | 'origin' | 'destination' | 'estimated_delivery' | 'actual_delivery'>>
  ): Promise<ApiResponse<Shipment>> => {
    const response = await apiClient.patch<ApiResponse<Shipment>>(`/shipments/${id}`, payload);
    return response.data;
  },

  getTimeline: async (id: string): Promise<ApiResponse<ShipmentTimeline[]>> => {
    const response = await apiClient.get<ApiResponse<ShipmentTimeline[]>>(`/shipments/${id}/timeline`);
    return response.data;
  },

  createTimelineEntry: async (
    shipmentId: string,
    payload: { status: string; notes?: string | null; location?: string | null }
  ): Promise<ApiResponse<ShipmentTimeline>> => {
    const response = await apiClient.post<ApiResponse<ShipmentTimeline>>(
      `/shipments/${shipmentId}/timeline`,
      payload
    );
    return response.data;
  },
};
