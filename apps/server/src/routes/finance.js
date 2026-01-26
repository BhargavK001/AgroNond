import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to require auth (finance might be accessible to admin and accountant)
router.use(requireAuth);

/**
 * GET /api/finance/stats
 * Get financial statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalStats,
            pendingStats,
            todayStats,
            totalCount
        ] = await Promise.all([
            // Total Revenue (Commission only? Or Total Turnover? Usually Revenue = Commission)
            // Let's assume Revenue = Total Commission for the committee.
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, total: { $sum: '$commission' } } }
            ]),
            // Pending Payments (Money we are waiting for from Traders)
            Record.aggregate([
                {
                    $match: {
                        status: { $in: ['Sold', 'Completed'] },
                        payment_status: { $ne: 'paid' }
                    }
                },
                // Trader pays Sale + Trader Commission (approx 9/13 of total commission + Sale)
                // For simplicity, let's assume Pending = Total Amount (Sale + All Comm) or just Sale + Trader Comm.
                // Converting: Pending Amount = sale_amount + (commission * 9/13)
                // But simplified: sum `sale_amount` + `commission` as rough estimate or use strict math.
                { $group: { _id: null, total: { $sum: { $add: ['$sale_amount', { $multiply: ['$commission', 0.69] }] } } } } // 9/13 ~= 0.69
            ]),
            // Collected Today (Commission collected today)
            Record.aggregate([
                {
                    $match: {
                        status: { $in: ['Sold', 'Completed'] },
                        payment_status: 'paid',
                        sold_at: { $gte: today }
                    }
                },
                { $group: { _id: null, total: { $sum: '$commission' } } }
            ]),
            Record.countDocuments({ status: { $in: ['Sold', 'Completed'] } })
        ]);

        res.json({
            totalRevenue: totalStats[0]?.total || 0,
            pendingPayments: Math.round(pendingStats[0]?.total || 0),
            collectedToday: todayStats[0]?.total || 0,
            transactionsCount: totalCount
        });
    } catch (error) {
        console.error("Finance stats error:", error);
        res.status(500).json({ error: "Failed to fetch finance stats" });
    }
});

/**
 * GET /api/finance/cashflow
 * Get cash flow records (received and pending)
 */
router.get('/cashflow', async (req, res) => {
    try {
        const records = await Record.find({ status: { $in: ['Sold', 'Completed'] } })
            .populate('farmer_id', 'full_name')
            .populate('trader_id', 'business_name full_name')
            .sort({ sold_at: -1 })
            .limit(50); // Limit for UI

        const received = [];
        const pending = [];

        records.forEach(record => {
            const base = record.sale_amount || 0;
            const comm = record.commission || 0;
            const farmerComm = Math.round(comm * (4 / 13));
            const traderComm = Math.round(comm * (9 / 13));
            const traderTotal = base + traderComm;

            const date = record.sold_at || record.createdAt;
            const ref = `TXN-${record.lot_id || record._id.toString().slice(-6)}`;

            if (record.payment_status === 'paid') {
                // Trader Payment Received
                received.push({
                    id: `${record._id}-trader`,
                    date: date,
                    from: record.trader_id?.business_name || 'Unknown Trader',
                    type: 'trader',
                    amount: traderTotal,
                    reference: ref
                });
                // Farmer Commission "Received" (Booked)
                received.push({
                    id: `${record._id}-farmer`,
                    date: date,
                    from: record.farmer_id?.full_name || 'Unknown Farmer',
                    type: 'farmer',
                    amount: farmerComm,
                    reference: ref
                });
            } else {
                // Pending
                const dueDate = new Date(date);
                dueDate.setDate(dueDate.getDate() + 7); // Assume 7 day credit

                const now = new Date();
                const diffTime = Math.abs(now - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isOverdue = now > dueDate;

                pending.push({
                    id: `${record._id}-trader`,
                    dueDate: dueDate,
                    from: record.trader_id?.business_name || 'Unknown Trader',
                    type: 'trader',
                    amount: traderTotal,
                    daysOverdue: isOverdue ? diffDays : 0,
                    reference: ref
                });
                // Farmer commission finding? usually we don't track farmer commission pending as a receivable in same way, 
                // but for consistency with "Accounting" view:
                pending.push({
                    id: `${record._id}-farmer`,
                    dueDate: dueDate,
                    from: record.farmer_id?.full_name || 'Unknown Farmer',
                    type: 'farmer',
                    amount: farmerComm,
                    daysOverdue: isOverdue ? diffDays : 0,
                    reference: ref
                });
            }
        });

        res.json({ received, pending });
    } catch (error) {
        console.error("Cashflow error:", error);
        res.status(500).json({ error: "Failed to fetch cashflow" });
    }
});

/**
 * GET /api/finance/billing-records
 * Get billing records list
 */
import Record from '../models/Record.js';

/**
 * GET /api/finance/billing-records
 * Get billing records list
 */
router.get('/billing-records', async (req, res) => {
    try {
        const { limit = 10, page = 1, period = 'all', role } = req.query;

        const query = { status: { $in: ['Sold', 'Completed'] } }; // Only completed sales

        // Date Filter
        if (period && period !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (period === 'today') {
                query.sold_at = { $gte: today };
            } else if (period === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                query.sold_at = { $gte: weekAgo };
            } else if (period === 'month') {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                query.sold_at = { $gte: monthStart };
            }
        }

        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            Record.find(query)
                .populate('farmer_id', 'full_name farmerId')
                .populate('trader_id', 'full_name business_name customId')
                .sort({ sold_at: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Record.countDocuments(query)
        ]);

        // Format for frontend
        // We will send generic "billing" objects that contain both sets of info, 
        // or frontend can interpret the Record object directly. 
        // Let's send cleaned up generic objects to match what the frontend likely expects, 
        // OR just send the records. Sending records is cleaner for strict REST but formatting here saves frontend work.
        // Let's return the records with populated fields.

        res.json({
            records,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Billing records error:", error);
        res.status(500).json({ error: "Failed to fetch billing records" });
    }
});

export default router;
