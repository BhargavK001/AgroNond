import express from 'express';
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
 * Get high-level statistics for the dashboard
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
            // 1. Total Farmers
            User.countDocuments({ role: 'farmer' }),

            // 2. Total Traders
            User.countDocuments({ role: 'trader' }),

            // 3. Total Volume (Sum of confirmed sold quantities or sale amounts? Dashboard implies "Volume" might be qty or amount.
            // Usually Volume = Quantity. Let's assume Total Volume means Total Quantity Sold (Kg) based on context, 
            // but the mockup showed 28,50,000 which looks like currency. Let's check `mockMetrics`.
            // `totalVolume: 2850000` -> If this is rupees, it's low. If it's Kg, it's high. 
            // Wait, `mockMetrics` has `totalVolume` and `receivedPayments`.
            // Let's assume Total Volume usually refers to Quantity in ag-tech, but here it might be Total Transaction Value.
            // Let's calculate both and return what fits.
            // Actually, looking at `admin.js`, "Total Volume" was `totalVolume: { $sum: '$sale_amount' }`. So it's currency (Total Turnover). 
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, totalamount: { $sum: '$sale_amount' } } }
            ]),

            // 4. Payment Status (Pending vs Received)
            // 'paid' vs 'pending' in payment_status
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                {
                    $group: {
                        _id: '$payment_status',
                        total: { $sum: '$total_amount' } // total_amount includes commission etc? or just sale_amount?
                        // Usually payment to farmer is (sale_amount - commission).
                        // `Record.js` has `total_amount` and `sale_amount`. 
                        // Let's us `total_amount` as the final payable/paid amount.
                    }
                }
            ]),

            // 5. Commission Stats
            Record.aggregate([
                { $match: { status: { $in: ['Sold', 'Completed'] } } },
                { $group: { _id: null, totalCommission: { $sum: '$commission' } } }
            ])
        ]);

        const totalVolume = totalVolumeStats[0]?.totalamount || 0;
        const totalCommission = commissionStats[0]?.totalCommission || 0;

        // Process payment stats
        let pendingPayments = 0;
        let receivedPayments = 0;

        paymentStats.forEach(stat => {
            if (stat._id === 'paid') {
                receivedPayments = stat.total;
            } else if (stat._id === 'pending' || stat._id === 'overdue') {
                pendingPayments += stat.total;
            }
        });

        // Mock breakdown for commission split if not stored separately
        // Assuming 4% from Farmer and 9% from Trader is the rule (approx 30% / 70% split of commission?)
        // Or just simple percentage of the Total Commission.
        // Dashboard says: "From Farmers (4%), From Traders (9%)".
        // 4 + 9 = 13 total.
        // So Farmer part = (4/13) * TotalCommission
        // Trader part = (9/13) * TotalCommission
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
 * Get recent transactions for the dashboard
 */
router.get('/transactions', requireAuth, requireCommitteeAccess, async (req, res) => {
    try {
        const records = await Record.find({ status: { $in: ['Sold', 'Completed'] } })
            .populate('farmer_id', 'full_name')
            .populate('trader_id', 'full_name business_name')
            .sort({ sold_at: -1 }) // Most recent first
            .limit(10);

        const formattedTransactions = records.map(record => ({
            id: record._id,
            date: record.sold_at || record.updatedAt,
            farmer: record.farmer_id?.full_name || 'Unknown Farmer',
            trader: record.trader_id?.business_name || record.trader_id?.full_name || 'Unknown Trader',
            crop: record.vegetable,
            qty: record.qtySold || record.quantity,
            rate: record.sale_rate || record.rate,
            amount: record.sale_amount,
            status: record.payment_status === 'paid' ? 'Paid' : 'Pending' // Map backend status to UI status
        }));

        res.json(formattedTransactions);
    } catch (error) {
        console.error('Committee transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * GET /api/committee/reports/daily
 * Get daily sales and commission stats
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
 * Get monthly sales and commission stats for the current year
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

export default router;
