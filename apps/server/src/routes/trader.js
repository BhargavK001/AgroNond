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
                    totalSpend: { $sum: '$sale_amount' }, // Does not include commission
                    totalCommission: { $sum: '$commission' },
                }
            }
        ]);

        // Calculate pending payments (Completed records where payment_status is pending or overdue)
        const pendingStats = await Record.aggregate([
            {
                $match: {
                    trader_id: new mongoose.Types.ObjectId(userId),
                    status: 'Completed',
                    payment_status: { $in: ['pending', 'overdue'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: '$total_amount' } // Full amount including commission
                }
            }
        ]);

        const result = {
            totalQuantity: stats[0]?.totalQuantity || 0,
            totalBaseSpend: stats[0]?.totalSpend || 0,
            totalCommission: stats[0]?.totalCommission || 0,
            totalSpend: (stats[0]?.totalSpend || 0) + (stats[0]?.totalCommission || 0),
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
            query.payment_status = payment_status;
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

/**
 * GET /api/trader/inventory
 * Get inventory items (Completed records bought by trader)
 */
router.get('/inventory', requireAuth, requireTrader, async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all completed records bought by this trader
        const records = await Record.find({
            trader_id: userId,
            status: 'Completed'
        })
            .populate('farmer_id', 'full_name') // To get farmer name if needed for location/origin
            .sort({ sold_at: -1 });

        // Map records to Inventory format
        const inventory = records.map(record => {
            // Calculate days in storage
            const soldDate = new Date(record.sold_at);
            const now = new Date();
            const daysInStorage = Math.floor((now - soldDate) / (1000 * 60 * 60 * 24));

            // Determine status based on age
            let status = 'good';
            if (daysInStorage > 10) status = 'critical';
            else if (daysInStorage > 5) status = 'low';

            // Determine location (Default to market or user location)
            // Ideally this would be a real field in a future "move stock" feature
            const location = record.market || (req.user.operating_locations && req.user.operating_locations[0]) || 'Warehouse A';

            return {
                id: record._id,
                crop: record.vegetable,
                batchId: record.lot_id || `LOT-${record._id.toString().substr(-6).toUpperCase()}`,
                quantity: record.official_qty,
                maxQuantity: record.official_qty, // Assuming full batch is initially available
                unit: 'kg',
                location: location,
                daysInStorage: daysInStorage,
                status: status,
                price: record.sale_rate
            };
        });

        res.json(inventory);
    } catch (error) {
        console.error('Inventory fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Temporary Seed Route
import User from '../models/User.js';
router.post('/seed', requireAuth, requireTrader, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find any farmer to associate with
        const farmer = await User.findOne({ role: 'farmer' });
        const farmerId = farmer ? farmer._id : new mongoose.Types.ObjectId();

        const dummyRecords = [
            {
                farmer_id: farmerId,
                vegetable: 'Tomatoes',
                official_qty: 150,
                sale_rate: 20,
                sale_amount: 3000,
                commission: 270,
                total_amount: 3270,
                status: 'Completed',
                payment_status: 'paid',
                trader_id: userId,
                sold_at: new Date(),
                market: 'Main Market'
            },
            {
                farmer_id: farmerId,
                vegetable: 'Onions',
                official_qty: 500,
                sale_rate: 15,
                sale_amount: 7500,
                commission: 675,
                total_amount: 8175,
                status: 'Completed',
                payment_status: 'pending',
                trader_id: userId,
                sold_at: new Date(Date.now() - 86400000), // Yesterday
                market: 'Main Market'
            },
            {
                farmer_id: farmerId,
                vegetable: 'Potatoes',
                official_qty: 1200,
                sale_rate: 12,
                sale_amount: 14400,
                commission: 1296,
                total_amount: 15696,
                status: 'Completed',
                payment_status: 'pending',
                trader_id: userId,
                sold_at: new Date(Date.now() - (86400000 * 6)), // 6 days ago (Low stock warning)
                market: 'Main Market'
            }
        ];

        await Record.insertMany(dummyRecords);
        res.json({ message: 'Dummy data seeded successfully' });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

export default router;
