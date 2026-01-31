import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Shipment } from '@/types/api';

export type AdminUser = { id: string; email: string };

export type CreateShipmentArg = {
  client_id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status?: string;
  estimated_delivery?: string | null;
  actual_delivery?: string | null;
};

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: ['AdminShipments', 'AdminUsers'],
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUser[], void>({
      query: () => 'admin/users',
      transformResponse: (response: { data?: AdminUser[] }) => response.data ?? [],
      providesTags: ['AdminUsers'],
    }),
    getAdminShipments: builder.query<Shipment[], void>({
      query: () => 'admin/shipments',
      transformResponse: (response: { data?: Shipment[] }) => response.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AdminShipments' as const, id })),
              { type: 'AdminShipments', id: 'LIST' },
            ]
          : [{ type: 'AdminShipments', id: 'LIST' }],
    }),
    createShipment: builder.mutation<{ data: Shipment }, CreateShipmentArg>({
      query: (body) => ({
        url: 'admin/shipments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminShipments', id: 'LIST' }, { type: 'Shipments', id: 'LIST' }],
    }),
    importShipmentsCsv: builder.mutation<
      { data: { imported: number } },
      { client_id: string; file: File }
    >({
      query: ({ client_id, file }) => {
        const fd = new FormData();
        fd.set('client_id', client_id);
        fd.set('file', file);
        return {
          url: 'admin/shipments/import',
          method: 'POST',
          body: fd,
        };
      },
      invalidatesTags: [{ type: 'AdminShipments', id: 'LIST' }, { type: 'Shipments', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminShipmentsQuery,
  useCreateShipmentMutation,
  useImportShipmentsCsvMutation,
  usePrefetch: usePrefetchAdmin,
} = adminApi;
