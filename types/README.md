# Types Directory

This directory contains all TypeScript type definitions and interfaces used throughout the application.

## Structure

- **`common.ts`** - Common types used across multiple modules (e.g., `CookieToSet`)
- **`components.ts`** - Component prop types and interfaces
- **`forms.ts`** - Form data types and interfaces
- **`middleware.ts`** - Middleware-specific types (re-exports from common when needed)
- **`index.ts`** - Central export point for all types
- **`react.d.ts`** - React type declarations

## Usage

Import types from the central index:

```typescript
import type { CookieToSet, LoginFormData } from '@/types';
```

Or import directly from specific files:

```typescript
import type { CookieToSet } from '@/types/common';
import type { LoginFormData } from '@/types/forms';
```

## Adding New Types

1. Determine the appropriate file:
   - Common/shared types → `common.ts`
   - Component props → `components.ts`
   - Form data → `forms.ts`
   - Module-specific → create new file (e.g., `database.ts`, `api.ts`)

2. Export the type from the file
3. Re-export from `index.ts` if it should be available globally
