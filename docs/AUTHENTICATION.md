
# Authentication System

AgroNond uses a custom **JWT-based Authentication** system with Phone OTP (One-Time Password) as the primary login method. This ensures a passwordless, secure, and mobile-first experience.

## Overview

- **Method**: Phone Number + OTP
- **Token**: JWT (JSON Web Token)
- **Session Management**: Client-side storage of JWT (localStorage/Cookies)
- **RBAC**: Strict Role-Based Access Control via Middleware

## User Roles

We define distinct roles in the system (`User.role`):

| Role        | Description |
| ----------- | -------------------------------------------------- |
| `farmer`    | Uploads produce records, views sales history. |
| `trader`    | Bids on crops, manages purchases and inventory. |
| `committee` | Oversees market activity, sets daily rates. |
| `admin`     | System administration and user management. |
| `weight`    | Weighs produce (checkpoint 1). |
| `lilav`     | Conducts auctions/sales (checkpoint 2). |
| `accounting`| Manages payments. |

## Implementation Details

### Database Schema

Users are stored in the **MongoDB** `users` collection.

```javascript
{
  phone: { type: String, unique: true },
  role: { type: String, default: 'farmer' }, // Enum: [...]
  full_name: String,
  // Role specific IDs are auto-generated
  farmerId: "FRM-2024-001",
  customId: "TRD-2024-005" 
}
```

### Auth Flow

1.  **Request OTP (`POST /api/auth/login`)**:
    *   Client sends `{ phone: "1234567890" }`.
    *   Server generates a numeric OTP (e.g., `123456`).
    *   (Dev Mode) OTP is logged to console. (Prod) OTP sent via SMS gateway.

2.  **Verify OTP (`POST /api/auth/verify`)**:
    *   Client sends `{ phone, otp }`.
    *   Server validates OTP.
    *   Server generates **JWT** signed with `JWT_SECRET`.
    *   Server returns `{ token, user }`.

3.  **Session Persistence**:
    *   Client stores `token` in `localStorage`.
    *   AuthContext initializes by verifying this token against `/api/auth/verify` or `/api/users/profile`.

### Backend Security

Backend routes are protected using the `requireAuth` middleware.

```javascript
// src/middleware/auth.js
const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = await User.findById(decoded.id);
```

### Frontend Protection

The `ProtectedRoute` component ensures unauthenticated users cannot access dashboard pages.

```jsx
<ProtectedRoute requireRole="trader">
  <TraderDashboard />
</ProtectedRoute>
```
