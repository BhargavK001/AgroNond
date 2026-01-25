
# AgroNond 🌾

> **Digital Mandi Platform - Connecting Farmers, Traders, and Committees**

AgroNond is a comprehensive platform designed to digitize agricultural markets (Mandis). It empowers farmers with fair pricing visibility, enables traders to discover produce efficiently, and provides market committees with digital tools for governance.

## 🚀 Key Features

- **For Farmers**: Digital record keeping of produce, real-time status tracking (Pending -> Weighed -> Sold), and sales history.
- **For Traders**: Dashboard to view daily transactions, purchase history, and market stats.
- **For Committees**: Role-based management, daily rate setting, and dispute resolution.
- **For Weight Staff**: Digital weighing interface to verify farmer produce.
- **For Lilav (Auction)**: Real-time auction entry system.
- **Secure Authentication**: Phone-based OTP login with JWT sessions and strict role-based access control (RBAC).

## 🛠️ Tech Stack

This project is a **Monorepo** containing:

- **Frontend** (`apps/web`): React, Vite, TailwindCSS, Framer Motion
- **Backend** (`apps/server`): Express.js, Node.js
- **Database**: MongoDB (with Mongoose ODM)
- **Mobile** (`apps/mobile`): React Native (Expo) - _In Development_

## 📚 Documentation

Detailed documentation for developers:

- [**Architecture Overview**](./docs/ARCHITECTURE.md): System design, folder structure, database schema, and data flow.
- [**API Reference**](./docs/API.md): Detailed list of backend API endpoints.
- [**Database Schema**](./docs/DATABASE.md): Explanation of User, Record, and DailyRate models.
- [**Developer Setup**](./docs/SETUP_DEV.md): Step-by-step guide to run the project locally.

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URL)

### 2. Install Dependencies

```bash
# Install backend deps
cd apps/server
npm install

# Install frontend deps
cd ../web
npm install
```

### 3. Setup Environment

**Backend (`apps/server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agronond
JWT_SECRET=your_super_secret_key_change_this_in_prod
FRONTEND_URL=http://localhost:5173
```

**Frontend (`apps/web/.env.local`):**
```env
# No specific vars needed for dev defaults, but can override:
# VITE_API_URL=http://localhost:5000/api
```

### 4. Run Locally

You will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd apps/server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd apps/web
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🔒 Security Note

This repository contains security configurations. **Do not commit `.env` files.** The `.gitignore` is configured to prevent this, but please be vigilant.

---

_Built for the future of Indian Agriculture._
