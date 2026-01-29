# Redux Store

This directory contains the Redux Toolkit store configuration and related files.

## Structure

- **`store.ts`** - Store configuration using `configureStore`
- **`provider.tsx`** - Redux Provider component for Next.js App Router (client component)
- **`hooks.ts`** - Typed hooks (`useAppDispatch`, `useAppSelector`, `useAppStore`)
- **`slices/`** - Redux slices directory
  - `exampleSlice.ts` - Example slice template
  - `index.ts` - Central export for all slices

## Usage

### In Components

```typescript
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store';

export default function MyComponent() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.example);
  
  // Use dispatch and data here
}
```

### Creating a New Slice

1. Create a new file in `slices/` directory
2. Export the reducer from `slices/index.ts`
3. Add the reducer to `store.ts`:

```typescript
import { exampleReducer } from './slices';

export const makeStore = () => {
  return configureStore({
    reducer: {
      example: exampleReducer,
    },
  });
};
```

## Next.js App Router Notes

- The store is created per-request to avoid sharing state between users
- Use `StoreProvider` in the root layout (already configured)
- All components using Redux must be client components (`'use client'`)
