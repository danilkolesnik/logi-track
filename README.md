# Logi Track

Client web portal for tracking shipments and managing documents.

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - type safety
- **Supabase** - backend and authentication
- **Tailwind CSS** - styling

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- `@supabase/supabase-js` and `@supabase/ssr` - for Supabase integration
- `tailwindcss`, `postcss`, `autoprefixer` - for styling

### 2. Configure Supabase

1. Create a project on [Supabase](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Fill in the environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  ├── login/          # Sign in page
  ├── dashboard/      # Dashboard (protected)
  ├── auth/           # Authentication API routes
  └── page.tsx        # Landing page

lib/
  ├── supabase/       # Supabase clients (client/server)
  └── store/          # Redux Toolkit store
      ├── store.ts    # Store configuration
      ├── provider.tsx # Redux Provider component
      ├── hooks.ts    # Typed Redux hooks
      └── slices/     # Redux slices

types/                # TypeScript type definitions
  ├── common.ts       # Common types
  ├── components.ts   # Component prop types
  ├── forms.ts        # Form data types
  └── index.ts        # Central type exports

middleware.ts         # Middleware for route protection
```

## Available Commands

- `npm run dev` - start development server
- `npm run build` - build project for production
- `npm start` - start production server
- `npm run lint` - run code linter

## Features (Phase 1)

- ✅ Public landing page
- ✅ Client sign in page
- ✅ Protected routes (middleware)
- ✅ Basic dashboard
- ✅ Request Access page
- ✅ Password recovery
- 🔄 Shipments list - in development
- 🔄 Documents section - in development

## Next Steps

1. Set up Supabase database (tables: users, shipments, documents)
2. Implement "Request Access" backend logic
3. Create shipments dashboard
4. Create documents section
5. Integrate with TMS API or manual data upload
