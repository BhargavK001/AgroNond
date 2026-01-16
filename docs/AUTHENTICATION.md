# Authentication System

AgroNond uses **Supabase Authentication** with Phone OTP (One-Time Password) as the primary login method. This ensures a passwordless, secure, and mobile-first experience suitable for our user base (farmers, traders).

## Overview

- **Provider**: Supabase Auth (Phone)
- **Token**: JWT (JSON Web Token)
- **Session Management**: Handled automatically by `@supabase/supabase-js` on the client.

## User Roles

We define four distinct roles in the system. Roles are stored in the `public.profiles` table, linked to the `auth.users` table.

| Role        | Description                                        |
| ----------- | -------------------------------------------------- |
| `farmer`    | Can list crops, view prices, and manage own sales. |
| `trader`    | Can bid on crops and manage purchases.             |
| `committee` | Market committee members who oversee operations.   |
| `admin`     | System administrators.                             |

## Implementation Details

### database Schema

The `public.profiles` table extends the default Supabase `auth.users` table:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone TEXT UNIQUE,
  role TEXT CHECK (role IN ('farmer', 'trader', 'committee', 'admin')),
  full_name TEXT,
  ...
);
```

### Security Policies (RLS)

Row Level Security is enable on `profiles`. Use policies to restrict access:

- **SELECT**: Users can only see their own profile.
- **UPDATE**: Users can only update their own profile.

### Frontend Auth Flow

1. **Sign In**: `supabase.auth.signInWithOtp({ phone })`
2. **Verify**: `supabase.auth.verifyOtp({ phone, token })`
3. **Session**: The session is persisted in `localStorage`.
4. **Context**: `AuthContext.jsx` provides `user` and `profile` objects to the React app.

### Backend Verification

The backend protects API routes using a middleware (`middleware/auth.js`) that verifies the JWT token sent in the `Authorization` header.

```javascript
// Example Protected Route
router.get("/profile", requireAuth, async (req, res) => {
  // req.user is populated with authenticated user data
});
```

## Testing

For development, use Supabase's **Test Phone Numbers** to avoid SMS costs and delays.

**Supabase Dashboard configuration:**
Authentication → Providers → Phone → Test Phone Numbers

**Format:** `CountryCode` + `Number` (No `+` sign)

Example:

- Log in with: `919876543210`
- OTP Code: `123456`
