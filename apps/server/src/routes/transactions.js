import express from 'express';
import Transaction from '../models/Transaction.js';
import Bill from '../models/Bill.js';
import Record from '../models/Record.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/transactions
 * List all transactions (Committee, Admin, Lilav only)
 */
router.get('/', requireAuth, requireRole('committee', 'admin', 'lilav', 'accounting'), async (req, res) => {
    try {
        const { limit = 50, date, farmer_id, trader_id } = req.query;
        
        let query = {};
        
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        
        if (farmer_id) {
            query.farmer_id = farmer_id;
        }
        
        if (trader_id) {
            query.trader_id = trader_id;
        }

        const transactions = await Transaction.find(query)
            .populate('farmer_id', 'full_name phone farmerId')
            .populate('trader_id', 'full_name phone business_name')
            .populate('sold_by', 'full_name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

/**
 * GET /api/transactions/stats
 * Dashboard statistics
 */
router.get('/stats', requireAuth, requireRole('committee', 'admin', 'lilav', 'accounting'), async (req, res) => {
    try {
        // Get overall stats
        const overallStats = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    total_transactions: { $sum: 1 },
                    total_base_amount: { $sum: '$base_amount' },
                    total_farmer_commission: { $sum: '$farmer_commission' },
                    total_trader_commission: { $sum: '$trader_commission' },
                    total_farmer_payable: { $sum: '$farmer_payable' },
                    total_trader_receivable: { $sum: '$trader_receivable' }
                }
            }
        ]);

        // Get payment status stats
        const farmerPaymentStats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$farmer_payment_status',
                    count: { $sum: 1 },
                    total: { $sum: '$farmer_payable' }
                }
            }
        ]);

        const traderPaymentStats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$trader_payment_status',
                    count: { $sum: 1 },
                    total: { $sum: '$trader_receivable' }
                }
            }
        ]);

        // Today's stats
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayStats = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    transactions: { $sum: 1 },
                    base_amount: { $sum: '$base_amount' },
                    total_commission: { $sum: { $add: ['$farmer_commission', '$trader_commission'] } }
                }
            }
        ]);

        const result = {
            overall: overallStats[0] || {
                total_transactions: 0,
                total_base_amount: 0,
                total_farmer_commission: 0,
                total_trader_commission: 0,
                total_farmer_payable: 0,
                total_trader_receivable: 0
            },
            farmer_payments: {
                pending: { count: 0, total: 0 },
                paid: { count: 0, total: 0 }
            },
            trader_payments: {
                pending: { count: 0, total: 0 },
                paid: { count: 0, total: 0 }
            },
            today: todayStats[0] || {
                transactions: 0,
                base_amount: 0,
                total_commission: 0
            }
        };

        // Process payment stats
        farmerPaymentStats.forEach(stat => {
            if (stat._id === 'pending') {
                result.farmer_payments.pending = { count: stat.count, total: stat.total };
            } else if (stat._id === 'paid') {
                result.farmer_payments.paid = { count: stat.count, total: stat.total };
            }
        });

        traderPaymentStats.forEach(stat => {
            if (stat._id === 'pending') {
                result.trader_payments.pending = { count: stat.count, total: stat.total };
            } else if (stat._id === 'paid') {
                result.trader_payments.paid = { count: stat.count, total: stat.total };
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction statistics' });
    }
});

/**
 * GET /api/transactions/:id
 * Single transaction detail
 */
router.get('/:id', requireAuth, requireRole('committee', 'admin', 'lilav', 'accounting'), async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id)
            .populate('farmer_id', 'full_name phone farmerId location')
            .populate('trader_id', 'full_name phone business_name gst_number')
            .populate('sold_by', 'full_name')
            .populate('farmer_bill_id')
            .populate('trader_bill_id')
            .populate('record_id', 'lot_id');

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Fetch transaction error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

/**
 * PATCH /api/transactions/:id/farmer-payment
 * Mark farmer payment as complete
 */
router.patch('/:id/farmer-payment', requireAuth, requireRole('committee', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, payment_mode, payment_reference } = req.body;

        if (!payment_status || !['pending', 'paid'].includes(payment_status)) {
            return res.status(400).json({ error: 'Valid payment_status required' });
        }

        const updateData = {
            farmer_payment_status: payment_status
        };

        if (payment_status === 'paid') {
            updateData.farmer_payment_date = new Date();
            if (payment_mode) {
                updateData.farmer_payment_mode = payment_mode;
            }
            if (payment_reference) {
                updateData.farmer_payment_reference = payment_reference;
            }
        }

        const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Also update the farmer's bill
        if (transaction.farmer_bill_id) {
            await Bill.findByIdAndUpdate(transaction.farmer_bill_id, {
                payment_status,
                payment_mode: payment_mode || '',
                payment_date: payment_status === 'paid' ? new Date() : null,
                payment_reference: payment_reference || ''
            });
        }

        // Update record payment status if both paid
        if (transaction.farmer_payment_status === 'paid' && transaction.trader_payment_status === 'paid') {
            await Record.findByIdAndUpdate(transaction.record_id, { payment_status: 'paid' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Update farmer payment error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

/**
 * PATCH /api/transactions/:id/trader-payment
 * Mark trader payment as received
 */
router.patch('/:id/trader-payment', requireAuth, requireRole('committee', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, payment_mode, payment_reference } = req.body;

        if (!payment_status || !['pending', 'paid'].includes(payment_status)) {
            return res.status(400).json({ error: 'Valid payment_status required' });
        }

        const updateData = {
            trader_payment_status: payment_status
        };

        if (payment_status === 'paid') {
            updateData.trader_payment_date = new Date();
            if (payment_mode) {
                updateData.trader_payment_mode = payment_mode;
            }
            if (payment_reference) {
                updateData.trader_payment_reference = payment_reference;
            }
        }

        const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Also update the trader's bill
        if (transaction.trader_bill_id) {
            await Bill.findByIdAndUpdate(transaction.trader_bill_id, {
                payment_status,
                payment_mode: payment_mode || '',
                payment_date: payment_status === 'paid' ? new Date() : null,
                payment_reference: payment_reference || ''
            });
        }

        // Update record payment status if both paid
        if (transaction.farmer_payment_status === 'paid' && transaction.trader_payment_status === 'paid') {
            await Record.findByIdAndUpdate(transaction.record_id, { payment_status: 'paid' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Update trader payment error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

/**
 * GET /api/transactions/pending-payments
 * List pending payments (for payment management page)
 */
router.get('/payments/pending', requireAuth, requireRole('committee', 'admin'), async (req, res) => {
    try {
        const { type } = req.query; // 'farmer' or 'trader'

        let query = {};
        
        if (type === 'farmer') {
            query.farmer_payment_status = 'pending';
        } else if (type === 'trader') {
            query.trader_payment_status = 'pending';
        } else {
            // Both pending
            query.$or = [
                { farmer_payment_status: 'pending' },
                { trader_payment_status: 'pending' }
            ];
        }

        const transactions = await Transaction.find(query)
            .populate('farmer_id', 'full_name phone farmerId')
            .populate('trader_id', 'full_name phone business_name')
            .populate('record_id', 'lot_id')
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error('Fetch pending payments error:', error);
        res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
});

export default router;
