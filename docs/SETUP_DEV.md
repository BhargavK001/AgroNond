
# Developer Setup Guide

Follow this guide to set up the AgroNond project locally on your machine.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**
- **MongoDB**: You need a running MongoDB instance (Local or Atlas).

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
    # Server Config
    PORT=5000
    NODE_ENV=development
    
    # Database
    MONGODB_URI=mongodb://localhost:27017/agronond
    
    # Security
    JWT_SECRET=dev_secret_key_123
    
    # CORS
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
    Create a `.env.local` file in `apps/web/` (Optional, as defaults work for localhost):

    ```env
    # Backend API URL (Optional override)
    # VITE_API_URL=http://localhost:5000
    ```

4. Run the frontend:
    ```bash
    npm run dev
    ```
    App should be accessible at `http://localhost:5173`.

## 4. Database Seeding (Optional)

To populate the database with test users (Farmer, Trader, Admin, etc.):

```bash
cd apps/server
npm run seed
```

This will create users with predefined phone numbers (e.g., `919876543210`) for testing.

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running (`mongod`).
- Check your `MONGODB_URI` string.

### Env Variables Not Loading
- Ensure `.env` is in the root of `apps/server` (not `src`).
- Restart the server after changing `.env` variables.
