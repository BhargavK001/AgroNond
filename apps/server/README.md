
# AgroNond Backend ⚙️

The Express.js API server for the AgroNond platform.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)
- **Logging**: Morgan

## 📂 Directory Structure

```
src/
├── config/         # Database configuration
├── middleware/     # Auth & Error handling
├── models/         # Mongoose Schemas
├── routes/         # API Endpoint Definitions
└── index.js        # Entry point
```

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create `.env`:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/agronond
    JWT_SECRET=your_jwt_secret
    FRONTEND_URL=http://localhost:5173
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📜 Scripts

- `npm start`: Run production server
- `npm run dev`: Run dev server (watch mode)
- `npm run seed`: Seed database with test users
