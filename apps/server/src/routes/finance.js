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
    // Mock response for now
    res.json({
        totalRevenue: 500000,
        pendingPayments: 25000,
        collectedToday: 12000,
        transactionsCount: 145
    });
});

/**
 * GET /api/finance/billing-records
 * Get billing records list
 */
router.get('/billing-records', async (req, res) => {
    const { limit = 10, page = 1 } = req.query;

    // Mock list
    const mockRecords = Array.from({ length: limit }, (_, i) => ({
        id: `bill-${i + 1}`,
        farmerName: `Farmer ${i + 1}`,
        amount: Math.floor(Math.random() * 10000),
        status: i % 3 === 0 ? 'pending' : 'paid',
        date: new Date().toISOString()
    }));

    res.json({
        records: mockRecords,
        total: 50,
        page: parseInt(page),
        totalPages: 5
    });
});

export default router;
