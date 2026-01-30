import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Shipment } from '@/types/api';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const shipmentsApi = createApi({
  reducerPath: 'shipmentsApi',
  baseQuery,
  tagTypes: ['Shipments'],
  endpoints: (builder) => ({
    getShipments: builder.query<Shipment[], void>({
      query: () => 'shipments',
      transformResponse: (response: { data?: Shipment[] }) => response.data ?? [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Shipments' as const, id })),
              { type: 'Shipments', id: 'LIST' },
            ]
          : [{ type: 'Shipments', id: 'LIST' }],
    }),
  }),
});

export const { useGetShipmentsQuery } = shipmentsApi;
