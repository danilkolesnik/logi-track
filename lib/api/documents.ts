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

  upload: async (
    shipmentId: string,
    file: File
  ): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shipment_id', shipmentId);
    const response = await apiClient.post<ApiResponse<Document>>('/documents', formData);
    return response.data;
  },
};
