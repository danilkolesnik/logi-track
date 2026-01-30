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

  getTimeline: async (id: string): Promise<ApiResponse<ShipmentTimeline[]>> => {
    const response = await apiClient.get<ApiResponse<ShipmentTimeline[]>>(`/shipments/${id}/timeline`);
    return response.data;
  },
};
