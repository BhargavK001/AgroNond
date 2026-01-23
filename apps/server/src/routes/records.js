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

export default router;
