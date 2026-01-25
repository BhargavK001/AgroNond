
# API Reference

Base URL: `/api`

All protected routes require specific headers:
```
Authorization: Bearer <your_jwt_token>
```

## Authentication (`/auth`)

| Method | Endpoint | Description | Public? |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login with phone number | Yes |
| `POST` | `/auth/verify` | Verify OTP and get Token | Yes |
| `POST` | `/auth/logout` | Clear session | No |

## Users (`/users`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/profile` | Get current user profile | All |
| `PATCH`| `/users/profile` | Update profile details | All |
| `POST` | `/users/set-role`| Switch user role (if allowed) | All |
| `GET` | `/users` | List users (with search/filter) | Admin/Committee |

## Records (`/records`)

Core agricultural data management.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/records/my-records` | List logged-in farmer's records | Farmer |
| `POST` | `/records/add` | Create new pending record | Farmer |
| `GET` | `/records/search-farmer` | Find farmer by phone | Weight/Lilav |
| `GET` | `/records/pending/:id` | Get pending records for farmer | Weight |
| `PATCH`| `/records/:id/weight` | Update official weight | Weight |
| `GET` | `/records/all-weighed` | Get records ready for auction | Lilav |
| `PATCH`| `/records/:id/sell` | Finalize sale (Assign Trader) | Lilav |
| `GET` | `/records/completed` | Get history of sold records | Admin/Committee |

## Trader (`/trader`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/trader/stats` | Get dashboard statistics | Trader |
| `GET` | `/trader/transactions` | Get purchase history | Trader |

## Daily Rates (`/daily-rates`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/daily-rates/today` | Get today's market rates | All |
| `GET` | `/daily-rates/date/:date`| Get rates for specific date | All |
| `POST` | `/daily-rates` | Set/Update single rate | Committee |
| `POST` | `/daily-rates/bulk` | Bulk update rates | Committee |

## Admin (`/admin`)

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | System-wide statistics | Admin |
| `POST` | `/admin/users` | Create/Manage users | Admin |
