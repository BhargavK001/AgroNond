# Developer Setup Guide

Follow this guide to set up the AgroNond project locally on your machine.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**
- **Supabase Account**: You need a project created at [supabase.com](https://supabase.com).

## 1. Clone the Repository

```bash
git clone https://github.com/BhargavK001/AgroNond.git
cd AgroNond
```

## 2. Backend Setup (`apps/server`)

1. Navigate to the server directory:

   ```bash
   cd apps/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:
   Create a `.env` file in `apps/server/` with the following content:

   ```env
   # Supabase Keys (from your Supabase Project Settings -> API)
   SUPABASE_URL=https://your-project-url.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key  # KEEP SECRET via .gitignore!

   # Server Config
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Run the server:
   ```bash
   npm run dev
   ```
   Server should start at `http://localhost:5000`.

## 3. Frontend Setup (`apps/web`)

1. Open a new terminal and navigate to the web directory:

   ```bash
   cd apps/web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment file:
   Create a `.env.local` file in `apps/web/` with the following content:

   ```env
   # Supabase Keys (Must match backend SUPABASE_URL and ANON_KEY)
   VITE_SUPABASE_URL=https://your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Backend API
   VITE_API_URL=http://localhost:5000
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```
   App should be accessible at `http://localhost:5173`.

## 4. Database Setup

1. Go to your Supabase Dashboard -> **SQL Editor**.
2. Run the migration script located at `apps/server/database/migrations/001_profiles.sql`.
3. Enable **Phone Auth** in Authentication -> Providers -> Phone.

## Common Issues

### Env Variables Not Loading

- Ensure `.env` is in the root of `apps/server` (not `src`).
- Restart the server after changing `.env` variables (`Ctrl+C` then `npm run dev`).

### Phone Auth Error "Unverified Number"

- Ensure you have added the number to **Test Phone Numbers** in Supabase if using a trial account.
- **Format:** `919876543210` (Country code YES, Plus sign NO).
