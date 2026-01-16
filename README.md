# AgroNond 🌾

> **Digital Mandi Platform - Connecting Farmers, Traders, and Committees**

AgroNond is a comprehensive platform designed to digitize agricultural markets (Mandis). It empowers farmers with fair pricing visibility, enables traders to discover produce efficiently, and provides market committees with digital tools for governance.

## 🚀 Key Features

- **For Farmers**: Real-time market prices, crop listing management, and direct connection with traders.
- **For Traders**: Discover crops, place bids, and manage purchases digitally.
- **For Committees**: Digital oversight, dispute resolution, and transaction verification.
- **Secure Authentication**: Phone-based OTP login with role-based access control.

## 🛠️ Tech Stack

This project is a **Monorepo** containing:

- **Frontend** (`apps/web`): React 19, Vite, TailwindCSS
- **Backend** (`apps/server`): Express.js, Node.js
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Mobile** (`apps/mobile`): React Native (Expo) - _In Development_

## 📚 Documentation

Detailed documentation for developers:

- [**Architecture Overview**](./docs/ARCHITECTURE.md): System design, folder structure, and data flow.
- [**Authentication System**](./docs/AUTHENTICATION.md): Deep dive into Supabase Auth & Security.
- [**Developer Setup**](./docs/SETUP_DEV.md): Step-by-step guide to run the project locally.

## ⚡ Quick Start

1. **Install Dependencies**

   ```bash
   # Install backend deps
   cd apps/server && npm install

   # Install frontend deps
   cd ../web && npm install
   ```

2. **Setup Environment**
   - Create `.env` in `apps/server`
   - Create `.env.local` in `apps/web`
   - See [Setup Guide](./docs/SETUP_DEV.md) for required variables.

3. **Run Locally**

   ```bash
   # Terminal 1: Backend
   cd apps/server && npm run dev

   # Terminal 2: Frontend
   cd apps/web && npm run dev
   ```

## 🔒 Security Note

This repository contains security configurations. **Do not commit `.env` files.** The `.gitignore` is configured to prevent this, but please be vigilant.

---

_Built for the future of Indian Agriculture._
