import express from 'express';
import mongoose from 'mongoose';
import Record from '../models/Record.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure user is a trader
const requireTrader = (req, res, next) => {
    if (req.user.role !== 'trader') {
        return res.status(403).json({ error: 'Access denied. Trader role required.' });
    }
    next();
};

/**
 * GET /api/trader/stats
 * Get aggregated stats for the trader dashboard
 */
router.get('/stats', requireAuth, requireTrader, async (req, res) => {
    try {
        const userId = req.user._id;

        // Aggregate stats for Completed records where this user is the trader
        const stats = await Record.aggregate([
            {
                $match: {
                    trader_id: new mongoose.Types.ObjectId(userId),
                    status: 'Completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalQuantity: { $sum: '$official_qty' },
                    // Use net_receivable_from_trader if available (new logic), else fallback
                    // We need to be careful with summing calculated fields if they are 0 in old records
                    // Better approach: sum(sale_amount) + sum(commission) is generally safer if net_receivable isn't populated on old records
                    totalBaseSpend: { $sum: '$sale_amount' },
                    totalCommission: { $sum: '$commission' },
                }
            }
        ]);

        // Calculate pending payments
        // Logic: active traders have 'trader_payment_status' as 'Pending'
        // Logic backup: check 'payment_status' for legacy compatibility
        const pendingStats = await Record.aggregate([
            {
                $match: {
                    trader_id: new mongoose.Types.ObjectId(userId),
                    status: 'Completed',
                    $or: [
                        { trader_payment_status: 'Pending' },
                        { payment_status: { $in: ['pending', 'overdue'] } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    // Total pending is the sum of what they owe (net_receivable_from_trader)
                    // If net_receivable is 0 (legacy), use sale_amount + commission
                    totalPending: {
                        $sum: {
                            $cond: {
                                if: { $gt: ['$net_receivable_from_trader', 0] },
                                then: '$net_receivable_from_trader',
                                else: { $add: ['$sale_amount', '$commission'] }
                            }
                        }
                    }
                }
            }
        ]);

        const totalBase = stats[0]?.totalBaseSpend || 0;
        const totalComm = stats[0]?.totalCommission || 0;

        const result = {
            totalQuantity: stats[0]?.totalQuantity || 0,
            totalBaseSpend: totalBase,
            totalCommission: totalComm,
            totalSpend: totalBase + totalComm,
            pendingPayments: pendingStats[0]?.totalPending || 0
        };

        res.json(result);
    } catch (error) {
        console.error('Trader stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/trader/transactions
 * Get transaction history
 */
router.get('/transactions', requireAuth, requireTrader, async (req, res) => {
    try {
        const { date, crop, payment_status, limit = 50 } = req.query;
        const userId = req.user._id;

        let query = {
            trader_id: userId,
            status: 'Completed'
        };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.sold_at = { $gte: startDate, $lte: endDate };
        }

        if (crop && crop !== 'All Crops') {
            query.vegetable = crop;
        }

        if (payment_status && payment_status !== 'All Status') {
            if (payment_status === 'Pending') {
                // Check both fields for robustness
                query.$or = [
                    { trader_payment_status: 'Pending' },
                    { payment_status: { $in: ['pending', 'overdue'] } }
                ];
            } else {
                query.$or = [
                    { trader_payment_status: payment_status },
                    { payment_status: payment_status } // Legacy Check
                ];
            }
        }

        const transactions = await Record.find(query)
            .sort({ sold_at: -1 })
            .limit(parseInt(limit))
            .populate('farmer_id', 'full_name phone')
            .populate('sold_by', 'full_name');

        res.json(transactions);
    } catch (error) {
        console.error('Trader transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

export default router;
