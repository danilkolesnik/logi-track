import apiClient from './client';
import type { AccessRequest, ApiResponse } from '@/types/api';

export const accessRequestsApi = {
  create: async (data: {
    email: string;
    company_name: string;
    message?: string | null;
  }): Promise<ApiResponse<AccessRequest>> => {
    const response = await apiClient.post<ApiResponse<AccessRequest>>(
      '/access-requests',
      data
    );
    return response.data;
  },

  getAll: async (status?: string): Promise<ApiResponse<AccessRequest[]>> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<ApiResponse<AccessRequest[]>>(
      '/access-requests',
      { params }
    );
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<ApiResponse<AccessRequest>> => {
    const response = await apiClient.patch<ApiResponse<AccessRequest>>(
      `/access-requests/${id}`,
      { status }
    );
    return response.data;
  },
};
