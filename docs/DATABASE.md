
# Database Schema

Database: **MongoDB**
ODM: **Mongoose**

## 1. User Model (`users`)

Stores all system users. Role-based differentiation logic is handled in the application layer.

| Field | Type | Description |
| :--- | :--- | :--- |
| `phone` | String | Unique Identifier (Primary Key equivalent) |
| `role` | String | Enum: `farmer`, `trader`, `committee`, `admin`, `weight`, `lilav`, `accounting` |
| `full_name`| String | Display Name |
| `farmerId` | String | Custom ID for farmers (`FRM-YYYY-NNN`) |
| `customId` | String | Custom ID for other roles (`TRD-`, `ADM-`, etc.) |
| `profile_picture`| String | Base64/URL |
| `location` | String | Address/City |
| `business_name`| String | For Traders |

**ID Generation Logic**:
Pre-save hooks automatically generate `farmerId` and `customId` based on the current year and sequence count of existing documents.

## 2. Record Model (`records`)

Tracks produce from entry to sale.

| Field | Type | Description |
| :--- | :--- | :--- |
| `farmer_id` | ObjectId | Ref: User (The seller) |
| `vegetable` | String | Crop name |
| `market` | String | Market location |
| `quantity` | Number | Farmer's estimated quantity |
| `status` | String | Enum: `Pending`, `Weighed`, `Sold`, `Completed` |
| `official_qty`| Number | Weight verified by staff |
| `weighed_by` | ObjectId | Ref: User (Staff) |
| `trader_id` | ObjectId | Ref: User (The buyer) |
| `sale_rate` | Number | Price per unit |
| `sale_amount` | Number | `official_qty * sale_rate` |
| `commission` | Number | Market fee |
| `total_amount`| Number | Final amount |
| `payment_status`| String | Enum: `paid`, `pending`, `overdue` |
| `lot_id` | String | Unique Lot ID (`LOT-YYYY-NNN`) |

## 3. Daily Rate Model (`dailyrates`)

Stores historical and current market pricing.

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | Date | Normalized to midnight (00:00:00) |
| `vegetable` | String | Crop name |
| `rate` | Number | Market rate |
| `unit` | String | e.g., 'kg', 'quintal' |
| `set_by` | ObjectId | Ref: User (Committee Member) |

## 4. Indexes

*   `User.phone` (Unique)
*   `User.farmerId`
*   `User.customId`
*   `Record.lot_id` (Unique)
*   `Record.farmer_id` (Indexed for fast lookup)
*   `Record.trader_id` (Indexed for fast lookup)
