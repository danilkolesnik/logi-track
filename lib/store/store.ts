import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './slices';
import { shipmentsApi } from './api/shipmentsApi';
import { adminApi } from './api/adminApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      [shipmentsApi.reducerPath]: shipmentsApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
        },
      }).concat(shipmentsApi.middleware, adminApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
