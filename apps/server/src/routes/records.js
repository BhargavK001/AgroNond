import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

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
            phone: { $regex: phone }, // Partial match or exact? Using regex for flexibility
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
 * Get pending records for a farmer
 */
router.get('/pending/:farmerId', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        // In a real app we might validate if farmerId is valid ObjectId

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

/**
 * PATCH /api/records/:id/weight
 * Update weight (official_qty)
 */
router.patch('/:id/weight', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { official_qty } = req.body;

        if (official_qty == null) {
            return res.status(400).json({ error: 'Weight required' });
        }

        const record = await Record.findByIdAndUpdate(
            id,
            {
                official_qty,
                status: 'Weighed',
                weighed_by: req.user._id,
                weighed_at: new Date()
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json(record);
    } catch (error) {
        console.error('Update weight error:', error);
        res.status(500).json({ error: 'Failed to update weight' });
    }
});


router.get('/weighed/:farmerId', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        const records = await Record.find({
            farmer_id: farmerId,
            status: 'Weighed'
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
 * Complete a sale (Lilav auction)
 */
router.patch('/:id/sell', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { trader_id, sale_rate } = req.body;

        if (!trader_id || sale_rate == null) {
            return res.status(400).json({ error: 'Trader and sale rate required' });
        }

        const record = await Record.findById(id);

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        if (record.status !== 'Weighed') {
            return res.status(400).json({ error: 'Record must be weighed before sale' });
        }

        const sale_amount = record.official_qty * sale_rate;

        const updatedRecord = await Record.findByIdAndUpdate(
            id,
            {
                trader_id,
                sale_rate,
                sale_amount,
                status: 'Completed',
                sold_by: req.user._id,
                sold_at: new Date()
            },
            { new: true }
        )
            .populate('farmer_id', 'full_name phone')
            .populate('trader_id', 'full_name phone business_name');

        res.json(updatedRecord);
    } catch (error) {
        console.error('Sell record error:', error);
        res.status(500).json({ error: 'Failed to complete sale' });
    }
});

/**
 * GET /api/records/completed
 * Get completed sales (transaction history)
 */
router.get('/completed', requireAuth, async (req, res) => {
    try {
        const { date } = req.query;

        let query = { status: 'Completed' };

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
