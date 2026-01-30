import apiClient from './client';
import type { Document, ApiResponse } from '@/types/api';

export const documentsApi = {
  getList: async (
    shipmentId?: string
  ): Promise<ApiResponse<Document[]>> => {
    const params = shipmentId ? { shipment_id: shipmentId } : {};
    const response = await apiClient.get<ApiResponse<Document[]>>(
      '/documents',
      { params }
    );
    return response.data;
  },
};
