import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Record from '../models/Record.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


const requireCommitteeAccess = (req, res, next) => {
    const allowedRoles = ['committee', 'admin', 'accounting'];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied: Committee/Admin access required' });
    }
};

/**
 * GET /api/committee/stats
 */
router.get('/stats', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const [
            totalFarmers,
            totalTraders,
            totalVolumeStats,
            paymentStats,
            commissionStats
        ] = await Promise.all([
            User.countDocuments({ role: 'farmer' }),
            User.countDocuments({ role: 'trader' }),
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, totalamount: { $sum: '$sale_amount' } } }
            ]),
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                {
                    $group: {
                        _id: '$payment_status',
                        total: { $sum: '$total_amount' }
                    }
                }
            ]),
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, totalCommission: { $sum: '$commission' } } }
            ])
        ]);

        const totalVolume = totalVolumeStats[0]?.totalamount || 0;
        const totalCommission = commissionStats[0]?.totalCommission || 0;

        let pendingPayments = 0;
        let receivedPayments = 0;

        paymentStats.forEach(stat => {
            if (stat._id === 'paid') {
                receivedPayments = stat.total;
            } else if (stat._id === 'pending' || stat._id === 'overdue') {
                pendingPayments += stat.total;
            }
        });

        const farmerCommission = Math.round(totalCommission * (4 / 13));
        const traderCommission = Math.round(totalCommission * (9 / 13));

        res.json({
            totalFarmers,
            totalTraders,
            totalVolume,
            pendingPayments,
            receivedPayments,
            totalCommission,
            farmerCommission,
            traderCommission
        });

    } catch (error) {
        console.error('Committee stats error:', error);
        res.status(500).json({ error: 'Failed to fetch committee statistics' });
    }
});

/**
 * GET /api/committee/transactions
 */
router.get('/transactions', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const records = await Record.find({
            status: { $in: ['Sold', 'Completed'] },
            is_parent: { $ne: true }
        })
            .populate('farmer_id', 'full_name')
            .populate('trader_id', 'full_name business_name')
            .sort({ sold_at: -1 })
            .limit(10);

        const formattedTransactions = records.map(record => ({
            id: record._id,
            date: record.sold_at || record.updatedAt,
            farmer: record.farmer_id?.full_name || 'Unknown Farmer',
            trader: record.trader_id?.business_name || record.trader_id?.full_name || 'Unknown Trader',
            crop: record.vegetable,
            qty: record.qtySold || record.quantity,
            carat: record.official_carat || record.carat || 0,
            rate: record.sale_rate || record.rate,
            amount: record.sale_amount,
            status: record.payment_status === 'paid' ? 'Paid' : 'Pending'
        }));

        res.json(formattedTransactions);
    } catch (error) {
        console.error('Committee transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * GET /api/committee/reports/daily
 */
router.get('/reports/daily', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - Number(days));

        const dailyStats = await Record.aggregate([
            {
                $match: {
                    status: { $in: ['Sold', 'Completed'] },
                    is_parent: { $ne: true },
                    sold_at: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$sold_at" } },
                    totalSales: { $sum: "$sale_amount" },
                    totalCommission: { $sum: "$commission" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(dailyStats);
    } catch (error) {
        console.error('Daily reports error:', error);
        res.status(500).json({ error: 'Failed to fetch daily reports' });
    }
});

/**
 * GET /api/committee/reports/monthly
 */
router.get('/reports/monthly', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${currentYear}-12-31T23:59:59.999Z`);

        const monthlyStats = await Record.aggregate([
            {
                $match: {
                    status: { $in: ['Sold', 'Completed'] },
                    is_parent: { $ne: true },
                    sold_at: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$sold_at" },
                    totalSales: { $sum: "$sale_amount" },
                    totalCommission: { $sum: "$commission" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(monthlyStats);
    } catch (error) {
        console.error('Monthly reports error:', error);
        res.status(500).json({ error: 'Failed to fetch monthly reports' });
    }
});


/**
 * GET /api/committee/traders/:id/history
 */
router.get('/traders/:id/history', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const { id } = req.params;
        const traderId = new mongoose.Types.ObjectId(id);

        const traderUser = await User.findById(traderId);
        if (!traderUser) {
            return res.status(404).json({ error: 'Trader not found' });
        }

        const matchStage = {
            $match: {
                $or: [
                    { trader_id: traderId },
                    { trader: traderUser.business_name },
                    { trader: traderUser.full_name }
                ],
                status: { $in: ['Sold', 'Completed'] }
            }
        };

        // 1. Get Stats
        const statsAggregation = await Record.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    totalPurchaseValue: { $sum: '$sale_amount' },
                    totalQuantity: { $sum: '$official_qty' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Calculate Pending Payments
        const pendingAggregation = await Record.aggregate([
            matchStage,
            {
                $match: {
                    $or: [
                        { trader_payment_status: 'Pending' },
                        { payment_status: { $in: ['pending', 'overdue'] } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
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

        // 3. Vegetable Summary
        const vegetableSummary = await Record.aggregate([
            matchStage,
            {
                $group: {
                    _id: '$vegetable',
                    quantity: { $sum: '$official_qty' },
                    amount: { $sum: '$sale_amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { quantity: -1 } }
        ]);

        // 4. Recent Transactions
        const records = await Record.find(matchStage.$match)
            .sort({ sold_at: -1 })
            .limit(50)
            .populate('farmer_id', 'full_name farmerId');

        const stats = {
            totalPurchaseValue: statsAggregation[0]?.totalPurchaseValue || 0,
            totalQuantity: statsAggregation[0]?.totalQuantity || 0,
            pendingPayment: pendingAggregation[0]?.totalPending || 0,
            vegetableSummary: vegetableSummary.map(v => ({
                name: v._id,
                quantity: v.quantity,
                amount: v.amount,
                count: v.count
            }))
        };

        res.json({ stats, records });

    } catch (error) {
        console.error('Trader history error:', error);
        res.status(500).json({ error: 'Failed to fetch trader history' });
    }
});

export default router;
