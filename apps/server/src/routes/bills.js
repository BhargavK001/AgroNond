import express from 'express';
import Bill from '../models/Bill.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/bills/my-bills
 * Get logged-in user's bills (privacy-filtered)
 * Farmers and traders can only see their own bills
 */
router.get('/my-bills', requireAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        
        let billFor;
        if (userRole === 'farmer') {
            billFor = 'farmer';
        } else if (userRole === 'trader') {
            billFor = 'trader';
        } else {
            // Committee, admin, etc. can see all bills through /api/bills/all
            return res.status(403).json({ error: 'Use /api/bills/all endpoint for admin access' });
        }

        const bills = await Bill.find({
            user_id: userId,
            bill_for: billFor
        })
            .populate('transaction_id', 'transaction_number')
            .sort({ createdAt: -1 });

        res.json(bills);
    } catch (error) {
        console.error('Fetch my bills error:', error);
        res.status(500).json({ error: 'Failed to fetch bills' });
    }
});

/**
 * GET /api/bills/all
 * Get all bills with full details (Committee, Admin only)
 */
router.get('/all', requireAuth, requireRole('committee', 'admin', 'lilav', 'accounting'), async (req, res) => {
    try {
        const { bill_for, payment_status, limit = 100 } = req.query;
        
        let query = {};
        
        if (bill_for && ['farmer', 'trader'].includes(bill_for)) {
            query.bill_for = bill_for;
        }
        
        if (payment_status && ['pending', 'paid'].includes(payment_status)) {
            query.payment_status = payment_status;
        }

        const bills = await Bill.find(query)
            .populate('user_id', 'full_name phone business_name farmerId')
            .populate('transaction_id', 'transaction_number farmer_id trader_id')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(bills);
    } catch (error) {
        console.error('Fetch all bills error:', error);
        res.status(500).json({ error: 'Failed to fetch bills' });
    }
});

/**
 * GET /api/bills/:id
 * Get specific bill (Owner or Committee/Admin)
 */
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const bill = await Bill.findById(id)
            .populate('user_id', 'full_name phone business_name farmerId')
            .populate('transaction_id', 'transaction_number farmer_id trader_id');

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        // Check access - owner or committee/admin
        const isOwner = bill.user_id._id.toString() === req.user._id.toString();
        const isAdmin = ['committee', 'admin', 'lilav', 'accounting'].includes(req.user.role);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(bill);
    } catch (error) {
        console.error('Fetch bill error:', error);
        res.status(500).json({ error: 'Failed to fetch bill' });
    }
});

/**
 * PATCH /api/bills/:id/payment
 * Update payment status (Committee, Admin only)
 */
router.patch('/:id/payment', requireAuth, requireRole('committee', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status, payment_mode, payment_reference } = req.body;

        if (!payment_status || !['pending', 'paid'].includes(payment_status)) {
            return res.status(400).json({ error: 'Valid payment_status required' });
        }

        const updateData = {
            payment_status
        };

        if (payment_status === 'paid') {
            updateData.payment_date = new Date();
            if (payment_mode) {
                updateData.payment_mode = payment_mode;
            }
            if (payment_reference) {
                updateData.payment_reference = payment_reference;
            }
        }

        const bill = await Bill.findByIdAndUpdate(id, updateData, { new: true })
            .populate('user_id', 'full_name phone business_name');

        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }

        res.json(bill);
    } catch (error) {
        console.error('Update bill payment error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

/**
 * GET /api/bills/stats
 * Get bill statistics
 */
router.get('/stats/summary', requireAuth, requireRole('committee', 'admin', 'lilav', 'accounting'), async (req, res) => {
    try {
        const stats = await Bill.aggregate([
            {
                $group: {
                    _id: {
                        bill_for: '$bill_for',
                        payment_status: '$payment_status'
                    },
                    count: { $sum: 1 },
                    total_amount: { $sum: '$final_amount' },
                    total_commission: { $sum: '$commission_amount' }
                }
            }
        ]);

        // Process stats into a cleaner format
        const result = {
            farmer: {
                pending: { count: 0, total_amount: 0 },
                paid: { count: 0, total_amount: 0 }
            },
            trader: {
                pending: { count: 0, total_amount: 0 },
                paid: { count: 0, total_amount: 0 }
            },
            total_commission: 0
        };

        stats.forEach(stat => {
            const { bill_for, payment_status } = stat._id;
            if (result[bill_for] && result[bill_for][payment_status]) {
                result[bill_for][payment_status] = {
                    count: stat.count,
                    total_amount: stat.total_amount
                };
            }
            result.total_commission += stat.total_commission;
        });

        res.json(result);
    } catch (error) {
        console.error('Bill stats error:', error);
        res.status(500).json({ error: 'Failed to fetch bill statistics' });
    }
});

export default router;
