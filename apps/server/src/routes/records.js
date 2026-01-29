import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
//  1. SPECIFIC GET ROUTES (Must come first)
// ==========================================

/**
 * GET /api/records/my-records
 * Fetch all records for the logged-in farmer
 * PRIVACY: Exclude trader details
 */
router.get('/my-records', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({ farmer_id: req.user._id })
            .select('-trader_id -trader_payment_ref -trader_payment_mode -trader_payment_status -net_receivable_from_trader -trader_commission') // Exclude trader info
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Fetch my records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

/**
 * GET /api/records/my-purchases
 * Fetch all purchases for the logged-in trader
 * PRIVACY: Exclude farmer details
 */
router.get('/my-purchases', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({ trader_id: req.user._id, status: { $in: ['Sold', 'Completed'] } })
            .select('-farmer_id -farmer_payment_ref -farmer_payment_mode -farmer_payment_status -net_payable_to_farmer -farmer_commission') // Exclude farmer info
            .sort({ sold_at: -1 });
        res.json(records);
    } catch (error) {
        console.error('Fetch my purchases error:', error);
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
});

/**
 * PATCH /api/records/:id/payment-status
 * Update payment status (Committee Only)
 */
router.patch('/:id/payment-status', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, status, mode, ref } = req.body; // type: 'farmer' or 'trader'

        if (!['farmer', 'trader'].includes(type)) {
            return res.status(400).json({ error: 'Invalid payment type' });
        }

        const updateField = type === 'farmer' ? 'farmer_payment_status' : 'trader_payment_status';
        const modeField = type === 'farmer' ? 'farmer_payment_mode' : 'trader_payment_mode';
        const refField = type === 'farmer' ? 'farmer_payment_ref' : 'trader_payment_ref';
        const dateField = type === 'farmer' ? 'farmer_payment_date' : 'trader_payment_date';

        const updateData = {
            [updateField]: status,
            [modeField]: mode || '',
            [refField]: ref || ''
        };

        if (status === 'Paid') {
            updateData[dateField] = new Date();
        }

        const record = await Record.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json(record);
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

/**
 * GET /api/records/search-farmer
 * Search farmer by phone (for weight staff)
 */
router.get('/search-farmer', requireAuth, async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ error: 'Phone number required' });
        }

        const farmer = await User.findOne({
            phone: { $regex: phone }, // Partial match
            role: 'farmer'
        });

        if (!farmer) {
            return res.status(404).json({ error: 'Farmer not found' });
        }

        res.json(farmer);
    } catch (error) {
        console.error('Search farmer error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /api/records/pending/:farmerId
 * Get pending records for a farmer (Specific param route)
 */
router.get('/pending/:farmerId', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;
        const records = await Record.find({
            farmer_id: farmerId,
            status: 'Pending'
        }).sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Fetch pending records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

// ==========================================
//  2. POST ROUTES
// ==========================================

/**
 * POST /api/records/add
 * Farmer adds new records
 */
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { market, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        const recordsToCreate = items.map(item => ({
            farmer_id: req.user._id,
            market: market,
            vegetable: item.vegetable,
            quantity: item.quantity,
            carat: item.carat || 0,
            status: 'Pending',
            qtySold: 0,
            rate: 0,
            totalAmount: 0,
            trader: '-'
        }));

        const savedRecords = await Record.insertMany(recordsToCreate);
        res.status(201).json(savedRecords);

    } catch (error) {
        console.error('Add record error:', error);
        res.status(500).json({ error: 'Failed to add records' });
    }
});

// ==========================================
//  3. DYNAMIC ID ROUTES (Must come last)
// ==========================================

/**
 * PUT /api/records/:id
 * Update a record (Edit Quantity/Market)
 */
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { market, quantity, carat } = req.body;

        const record = await Record.findOneAndUpdate(
            { _id: req.params.id, farmer_id: req.user._id },
            { market, quantity, carat: carat || 0 },
            { new: true }
        );

        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

/**
 * DELETE /api/records/:id
 * Delete a pending record
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const record = await Record.findOneAndDelete({
            _id: req.params.id,
            farmer_id: req.user._id
        });

        if (!record) {
            return res.status(404).json({ error: 'Record not found or unauthorized' });
        }
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

/**
 * PATCH /api/records/:id/weight
 * Update weight (official_qty)
 */
router.patch('/:id/weight', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { official_qty, official_carat } = req.body;
        // Import notification service dynamically to avoid circular dependencies if any
        const { createNotification } = await import('../services/notificationService.js');

        if (official_qty == null && official_carat == null) {
            return res.status(400).json({ error: 'Weight or Carat required' });
        }

        const record = await Record.findByIdAndUpdate(
            id,
            {
                official_qty,
                official_carat: official_carat || 0,
                status: 'Weighed',
                weighed_by: req.user._id,
                weighed_at: new Date()
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        // TRIGGER NOTIFICATION: Weight Recorded
        if (record.farmer_id) {
            await createNotification({
                recipient: record.farmer_id,
                type: 'info',
                title: 'Weight Recorded',
                message: `Your produce (${record.vegetable}) has been weighed: ${record.official_qty} kg / ${record.official_carat} carat.`,
                data: { recordId: record._id, type: 'weight' }
            });
        }

        res.json(record);
    } catch (error) {
        console.error('Update weight error:', error);
        res.status(500).json({ error: 'Failed to update weight' });
    }
});


/**
 * GET /api/records/farmer/:farmerId/history
 * Get all history for a specific farmer (Committee View)
 */
router.get('/farmer/:farmerId/history', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        // Fetch all records for this farmer
        const records = await Record.find({ farmer_id: farmerId })
            .populate('trader_id', 'full_name business_name phone')
            .sort({ createdAt: -1 });

        // Calculate Stats
        let totalRevenue = 0;
        let totalQuantity = 0;
        let pendingPayment = 0;
        const vegetableStats = {};

        records.forEach(record => {
            // Only count Sold items for revenue
            if (record.status === 'Sold' || record.status === 'Completed') {
                totalRevenue += record.total_amount || 0;

                // Track pending payments
                if (record.farmer_payment_status === 'Pending') {
                    pendingPayment += record.net_payable_to_farmer || 0;
                }
            }

            // Count quantity (official weight preferred, else estimated)
            const qty = record.official_qty || record.quantity || 0;
            totalQuantity += qty;

            // Vegetable stats
            if (!vegetableStats[record.vegetable]) {
                vegetableStats[record.vegetable] = {
                    name: record.vegetable,
                    quantity: 0,
                    count: 0,
                    revenue: 0
                };
            }
            vegetableStats[record.vegetable].quantity += qty;
            vegetableStats[record.vegetable].count += 1;
            if (record.status === 'Sold') {
                vegetableStats[record.vegetable].revenue += record.total_amount || 0;
            }
        });

        res.json({
            records,
            stats: {
                totalRevenue,
                totalQuantity,
                pendingPayment,
                vegetableSummary: Object.values(vegetableStats)
            }
        });

    } catch (error) {
        console.error('Fetch farmer history error:', error);
        res.status(500).json({ error: 'Failed to fetch farmer history' });
    }
});


/**
 * GET /api/records/weighed/:farmerId
 * Get weighed records for a farmer (today only for Lilav)
 */
router.get('/weighed/:farmerId', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        // Get start and end of today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const records = await Record.find({
            farmer_id: farmerId,
            status: 'Weighed',
            weighed_at: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Fetch weighed records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

/**
 * GET /api/records/all-weighed
 * Get all weighed records (for Lilav dashboard)
 */
router.get('/all-weighed', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({
            status: 'Weighed'
        })
            .populate('farmer_id', 'full_name phone')
            .sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Fetch all weighed records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

/**
 * PATCH /api/records/:id/sell
 * Assign Rate and Trader (Committee Step 1)
 * Moves Status: Pending -> RateAssigned
 */
router.patch('/:id/sell', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { trader_id, sale_rate, sale_unit } = req.body;

        if (!trader_id || sale_rate == null) {
            return res.status(400).json({ error: 'Trader and sale rate required' });
        }

        const record = await Record.findById(id);

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        // Allow 'Pending' records to be assigned a rate
        if (record.status !== 'Pending' && record.status !== 'RateAssigned') {
            return res.status(400).json({ error: 'Record status must be Pending to assign rate' });
        }

        const updatedRecord = await Record.findByIdAndUpdate(
            id,
            {
                trader_id,
                sale_rate,
                sale_unit: sale_unit || 'kg',
                status: 'RateAssigned',
                // No calculations yet - wait for weight
            },
            { new: true }
        )
            .populate('farmer_id', 'full_name phone')
            .populate('trader_id', 'full_name phone business_name');

        res.json(updatedRecord);
    } catch (error) {
        console.error('Assign rate error:', error);
        res.status(500).json({ error: 'Failed to assign rate' });
    }
});

/**
 * GET /api/records/completed
 * Get completed sales (transaction history)
 */
router.get('/completed', requireAuth, async (req, res) => {
    try {
        const { date } = req.query;

        let query = { status: { $in: ['Sold', 'Completed'] } };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.sold_at = { $gte: startDate, $lte: endDate };
        }

        const records = await Record.find(query)
            .populate('farmer_id', 'full_name phone')
            .populate('trader_id', 'full_name phone business_name')
            .populate('sold_by', 'full_name')
            .sort({ sold_at: -1 });

        res.json(records);
    } catch (error) {
        console.error('Fetch completed records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

export default router;
