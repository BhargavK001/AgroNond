import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Record from '../models/Record.js';

const router = express.Router();
// Middleware to require auth
router.use(requireAuth);

/**
 * POST /api/finance/pay-farmer/:id
 * Process payment to farmer
 */
router.post('/pay-farmer/:id', async (req, res) => {
    try {
        const { mode, ref, date } = req.body;

        if (!mode) return res.status(400).json({ error: 'Payment mode required' });

        const record = await Record.findByIdAndUpdate(
            req.params.id,
            {
                farmer_payment_status: 'Paid',
                farmer_payment_mode: mode,
                farmer_payment_ref: ref,
                farmer_payment_date: date || new Date(),
                // If the overall payment is done when both are paid, check that?
                // For now, let's keep them independent.
                payment_status: 'pending' // Keep overall pending until trader pays too? Or modify logic.
            },
            { new: true }
        );

        if (!record) return res.status(404).json({ error: 'Record not found' });

        // Update overall payment_status if both are paid?
        // Let's rely on specific statuses primarily.

        res.json(record);
    } catch (error) {
        console.error('Pay farmer error:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

/**
 * POST /api/finance/receive-trader/:id
 * Process payment from trader
 */
router.post('/receive-trader/:id', async (req, res) => {
    try {
        const { mode, ref, date } = req.body;

        if (!mode) return res.status(400).json({ error: 'Payment mode required' });

        const record = await Record.findByIdAndUpdate(
            req.params.id,
            {
                trader_payment_status: 'Paid',
                trader_payment_mode: mode,
                trader_payment_ref: ref,
                trader_payment_date: date || new Date(),
                payment_status: 'paid' // Mark main status as paid when Money is Received
            },
            { new: true }
        );

        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (error) {
        console.error('Receive trader error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});

/**
 * GET /api/finance/stats
 * Get financial statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalCommission,
            pendingReceivables, // Amount
            collectedToday,
            totalCount,
            // New Aggregations
            totalBaseAmount,
            receivedPayments,
            farmerPaymentsPaid,
            farmerPaymentsDue,
            pendingCount // Count of pending trader payments
        ] = await Promise.all([
            // 1. Total Commission
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, total: { $sum: '$commission' } } }
            ]),
            // 2. Pending Receivables (Traders) - Amount
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] }, trader_payment_status: 'Pending' } },
                { $group: { _id: null, total: { $sum: '$net_receivable_from_trader' } } }
            ]),
            // 3. Collected Today (Commission Only?) - Maybe keep as is
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] }, trader_payment_status: 'Paid', trader_payment_date: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$commission' } } }
            ]),
            // 4. Total Count
            Record.countDocuments({ status: { $in: ['Sold', 'Completed'] } }),

            // 5. Total Base Amount (Sale Amount)
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, total: { $sum: '$sale_amount' } } }
            ]),
            // 6. Received Payments (Traders) - Total Amount Received
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] }, trader_payment_status: 'Paid' } },
                { $group: { _id: null, total: { $sum: '$net_receivable_from_trader' } } }
            ]),
            // 7. Farmer Payments Paid
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] }, farmer_payment_status: 'Paid' } },
                { $group: { _id: null, total: { $sum: '$net_payable_to_farmer' } } }
            ]),
            // 8. Farmer Payments Due
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] }, farmer_payment_status: 'Pending' } },
                { $group: { _id: null, total: { $sum: '$net_payable_to_farmer' } } }
            ]),
            // 9. Pending Count (Traders)
            Record.countDocuments({ status: { $in: ['Sold', 'Completed'] }, trader_payment_status: 'Pending' })
        ]);

        res.json({
            totalRevenue: totalCommission[0]?.total || 0, // Keep for compatibility if used elsewhere
            totalCommission: totalCommission[0]?.total || 0,
            pendingPayments: Math.round(pendingReceivables[0]?.total || 0),
            collectedToday: collectedToday[0]?.total || 0,
            transactionsCount: totalCount,

            // New Fields for AccountingOverview
            totalBaseAmount: totalBaseAmount[0]?.total || 0,
            totalTransactions: totalCount,
            receivedPayments: receivedPayments[0]?.total || 0,
            farmerPaymentsPaid: farmerPaymentsPaid[0]?.total || 0,
            farmerPaymentsDue: farmerPaymentsDue[0]?.total || 0,
            pendingCount: pendingCount || 0
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
            .limit(50);

        const received = [];
        const pending = [];

        records.forEach(record => {
            const date = record.sold_at || record.createdAt;
            const ref = `TXN-${record.lot_id || record._id.toString().slice(-6)}`;

            // 1. Trader Transaction (Receivable)
            if (record.trader_payment_status === 'Paid') {
                received.push({
                    id: `${record._id}-trader`,
                    date: record.trader_payment_date || date,
                    from: record.trader_id?.business_name || 'Unknown Trader',
                    type: 'trader',
                    amount: record.net_receivable_from_trader, // Full amount received
                    reference: ref,
                    mode: record.trader_payment_mode
                });
            } else {
                const dueDate = new Date(date);
                dueDate.setDate(dueDate.getDate() + 7);
                const isOverdue = new Date() > dueDate;

                pending.push({
                    id: `${record._id}-trader`,
                    dueDate: dueDate,
                    from: record.trader_id?.business_name || 'Unknown Trader',
                    type: 'trader',
                    label: 'Receivable from Trader',
                    amount: record.net_receivable_from_trader,
                    daysOverdue: isOverdue ? 1 : 0,
                    reference: ref,
                    recordId: record._id
                });
            }

            // 2. Farmer Transaction (Payable)
            // Note: "Received" list usually shows Money In. Money Out is "Expenses/Payouts".
            // The prompt asks for "Cashflow". 
            // If they want to see "Paid to Farmer", it might belong in a separate list or "Paid" section.
            // But if the UI has "Received" and "Pending", "Pending" usually implies Action Items.
            // Pending Payables are Action Items.

            if (record.farmer_payment_status === 'Pending') {
                const dueDate = new Date(date);
                dueDate.setDate(dueDate.getDate() + 1); // Pay farmer next day?

                pending.push({
                    id: `${record._id}-farmer`,
                    dueDate: dueDate,
                    from: record.farmer_id?.full_name || 'Unknown Farmer',
                    type: 'farmer', // Logic: "from" is usually "Party". Here Party is Farmer.
                    label: 'Payable to Farmer',
                    amount: record.net_payable_to_farmer,
                    daysOverdue: 0,
                    reference: ref,
                    recordId: record._id
                });
            } else {
                // If we want to show "Paid to Farmer" history, we could add to a 'paid' list?
                // For now, let's just show Receivables in 'Received' tab if that's what it means.
                // Or maybe 'Received' is 'Completed Transactions'.
                // Let's include Farmer Payments in 'Received' but with negative amount or type indication if UI supports it?
                // The current UI seems to be "Cashflow" -> Money In / Money Out?
                // Let's assume 'Received' tab = Completed Transactions.
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
