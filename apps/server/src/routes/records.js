import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Bill from '../models/Bill.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Commission rates (in percentage)
const FARMER_COMMISSION_RATE = 4; // 4% deducted from farmer
const TRADER_COMMISSION_RATE = 9; // 9% added for trader

// ==========================================
//  1. SPECIFIC GET ROUTES (Must come first)
// ==========================================

/**
 * GET /api/records/my-records
 * Fetch all records for the logged-in farmer
 */
router.get('/my-records', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({ farmer_id: req.user._id })
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Fetch my records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
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
        const { market, quantity } = req.body;

        const record = await Record.findOneAndUpdate(
            { _id: req.params.id, farmer_id: req.user._id },
            { market, quantity },
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
 * Complete a sale (Lilav auction) with commission calculation and bill generation
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

        // Calculate amounts
        const quantity = record.official_qty;
        const base_amount = quantity * sale_rate;
        
        // Farmer commission (4% deducted from base)
        const farmer_commission = Math.round((base_amount * FARMER_COMMISSION_RATE / 100) * 100) / 100;
        const farmer_payable = base_amount - farmer_commission;
        
        // Trader commission (9% added to base)
        const trader_commission = Math.round((base_amount * TRADER_COMMISSION_RATE / 100) * 100) / 100;
        const trader_receivable = base_amount + trader_commission;

        // Create Transaction record
        const transaction = new Transaction({
            record_id: record._id,
            farmer_id: record.farmer_id,
            trader_id: trader_id,
            vegetable: record.vegetable,
            quantity: quantity,
            rate: sale_rate,
            base_amount: base_amount,
            farmer_commission_rate: FARMER_COMMISSION_RATE,
            farmer_commission: farmer_commission,
            trader_commission_rate: TRADER_COMMISSION_RATE,
            trader_commission: trader_commission,
            farmer_payable: farmer_payable,
            trader_receivable: trader_receivable,
            market: record.market,
            sold_by: req.user._id
        });
        
        await transaction.save();

        // Create Farmer Bill
        const farmerBill = new Bill({
            bill_for: 'farmer',
            user_id: record.farmer_id,
            transaction_id: transaction._id,
            record_id: record._id,
            vegetable: record.vegetable,
            quantity: quantity,
            rate: sale_rate,
            base_amount: base_amount,
            commission_rate: FARMER_COMMISSION_RATE,
            commission_amount: farmer_commission,
            final_amount: farmer_payable,
            market: record.market
        });
        
        await farmerBill.save();

        // Create Trader Bill
        const traderBill = new Bill({
            bill_for: 'trader',
            user_id: trader_id,
            transaction_id: transaction._id,
            record_id: record._id,
            vegetable: record.vegetable,
            quantity: quantity,
            rate: sale_rate,
            base_amount: base_amount,
            commission_rate: TRADER_COMMISSION_RATE,
            commission_amount: trader_commission,
            final_amount: trader_receivable,
            market: record.market
        });
        
        await traderBill.save();

        // Update transaction with bill references
        transaction.farmer_bill_id = farmerBill._id;
        transaction.trader_bill_id = traderBill._id;
        await transaction.save();

        // Update the original record with all data
        const updatedRecord = await Record.findByIdAndUpdate(
            id,
            {
                trader_id,
                sale_rate,
                sale_amount: base_amount,
                status: 'Completed',
                sold_by: req.user._id,
                sold_at: new Date(),
                // Commission breakdown
                farmer_commission_amount: farmer_commission,
                farmer_payable_amount: farmer_payable,
                trader_commission_amount: trader_commission,
                trader_receivable_amount: trader_receivable,
                // Total commission (sum for market committee)
                commission: farmer_commission + trader_commission,
                total_amount: trader_receivable,
                // References
                transaction_id: transaction._id,
                farmer_bill_id: farmerBill._id,
                trader_bill_id: traderBill._id
            },
            { new: true }
        )
            .populate('farmer_id', 'full_name phone')
            .populate('trader_id', 'full_name phone business_name');

        res.json({
            record: updatedRecord,
            transaction: {
                transaction_number: transaction.transaction_number,
                base_amount,
                farmer_commission,
                farmer_payable,
                trader_commission,
                trader_receivable
            },
            bills: {
                farmer: {
                    bill_number: farmerBill.bill_number,
                    final_amount: farmer_payable
                },
                trader: {
                    bill_number: traderBill.bill_number,
                    final_amount: trader_receivable
                }
            }
        });
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
