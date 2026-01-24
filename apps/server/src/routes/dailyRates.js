import express from 'express';
import DailyRate from '../models/DailyRate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get today's rates
router.get('/today', requireAuth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rates = await DailyRate.find({ date: today })
            .populate('set_by', 'full_name')
            .sort({ vegetable: 1 });

        res.json(rates);
    } catch (error) {
        console.error('Error fetching today rates:', error);
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
});

// Get rates for a specific date
router.get('/date/:date', requireAuth, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        date.setHours(0, 0, 0, 0);

        const rates = await DailyRate.find({ date })
            .populate('set_by', 'full_name')
            .sort({ vegetable: 1 });

        res.json(rates);
    } catch (error) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
});

// Get rate for a specific vegetable today
router.get('/vegetable/:vegetable', requireAuth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rate = await DailyRate.findOne({
            date: today,
            vegetable: req.params.vegetable
        });

        res.json(rate || { rate: 0 });
    } catch (error) {
        console.error('Error fetching vegetable rate:', error);
        res.status(500).json({ error: 'Failed to fetch rate' });
    }
});

// Set or update rate for a vegetable
router.post('/', requireAuth, async (req, res) => {
    try {
        const { vegetable, rate, unit = 'kg' } = req.body;

        if (!vegetable || rate === undefined) {
            return res.status(400).json({ error: 'Vegetable and rate are required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyRate = await DailyRate.findOneAndUpdate(
            { date: today, vegetable },
            {
                date: today,
                vegetable,
                rate,
                unit,
                set_by: req.user.id
            },
            { upsert: true, new: true }
        ).populate('set_by', 'full_name');

        res.json(dailyRate);
    } catch (error) {
        console.error('Error setting rate:', error);
        res.status(500).json({ error: 'Failed to set rate' });
    }
});

// Bulk set rates
router.post('/bulk', requireAuth, async (req, res) => {
    try {
        const { rates } = req.body; // Array of { vegetable, rate, unit }

        if (!rates || !Array.isArray(rates)) {
            return res.status(400).json({ error: 'Rates array is required' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const operations = rates.map(item => ({
            updateOne: {
                filter: { date: today, vegetable: item.vegetable },
                update: {
                    $set: {
                        date: today,
                        vegetable: item.vegetable,
                        rate: item.rate,
                        unit: item.unit || 'kg',
                        set_by: req.user.id
                    }
                },
                upsert: true
            }
        }));

        await DailyRate.bulkWrite(operations);

        const updatedRates = await DailyRate.find({ date: today })
            .populate('set_by', 'full_name')
            .sort({ vegetable: 1 });

        res.json(updatedRates);
    } catch (error) {
        console.error('Error bulk setting rates:', error);
        res.status(500).json({ error: 'Failed to set rates' });
    }
});

// Delete a rate
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await DailyRate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rate deleted successfully' });
    } catch (error) {
        console.error('Error deleting rate:', error);
        res.status(500).json({ error: 'Failed to delete rate' });
    }
});

export default router;
