import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { createAuditLog, getClientIp, AuditDescriptions } from '../utils/auditLogger.js';

const router = express.Router();

//  1. SPECIFIC GET ROUTES (Must come first)
router.get('/my-records', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const skip = (page - 1) * limit;

        // Build query
        const query = {
            farmer_id: req.user._id,
            parent_record_id: { $exists: false } // Exclude child records
        };

        // "Partial" is a computed display_status, not stored in DB
        // We need special handling for it
        const isPartialFilter = status === 'Partial';

        if (status && status !== 'All' && !isPartialFilter) {
            query.status = status;
        }

        // For Partial filter, we first need to get all parent records
        // and compute their display_status, then filter
        if (isPartialFilter) {
            // Get all parent records for this farmer (no pagination yet)
            const allParentRecords = await Record.find({
                farmer_id: req.user._id,
                parent_record_id: { $exists: false },
                is_parent: true // Only parent records can have Partial status
            })
                .populate('farmer_id', 'full_name phone farmerId')
                .select('-trader_id -trader_payment_ref -trader_payment_mode -trader_payment_status -net_receivable_from_trader -trader_commission')
                .sort({ createdAt: -1 })
                .lean();

            // Get child records for all these parents
            const parentIds = allParentRecords.map(r => r._id);

            const childRecords = await Record.find({
                parent_record_id: { $in: parentIds },
                status: { $in: ['Sold', 'Completed', 'RateAssigned', 'Weighed'] }
            }).sort({ createdAt: 1 });

            // Group children by parent
            const parentMap = {};
            childRecords.forEach(child => {
                const pId = child.parent_record_id.toString();
                if (!parentMap[pId]) {
                    parentMap[pId] = {
                        splits: [],
                        soldQty: 0,
                        soldCarat: 0,
                        totalSaleAmount: 0,
                        childCount: 0,
                        soldCount: 0,
                        weightPendingQty: 0,
                        weightPendingCarat: 0,
                        weightPendingCount: 0
                    };
                }

                // Check if this is a weight pending item (RateAssigned with no official weight)
                const isWeightPending = child.status === 'RateAssigned' &&
                    (child.official_qty || 0) === 0 && (child.official_carat || 0) === 0;

                // For weight pending items, use allocated qty; for sold items, use official qty
                const childQty = isWeightPending
                    ? (child.allocated_qty || child.quantity || 0)  // Allocated for weight pending
                    : (child.official_qty || child.quantity || 0);  // Official for sold
                const childCarat = isWeightPending
                    ? (child.allocated_carat || child.carat || 0)
                    : (child.official_carat || child.carat || 0);
                const amount = child.sale_amount || child.total_amount || 0;

                if (isWeightPending) {
                    // Track weight pending separately
                    parentMap[pId].weightPendingQty += childQty;
                    parentMap[pId].weightPendingCarat += childCarat;
                    parentMap[pId].weightPendingCount += 1;
                } else {
                    // Only count as sold if actually weighed
                    parentMap[pId].soldQty += childQty;
                    parentMap[pId].soldCarat += childCarat;
                    parentMap[pId].totalSaleAmount += amount;
                }
                parentMap[pId].childCount += 1;

                if (['Sold', 'Completed'].includes(child.status)) {
                    parentMap[pId].soldCount += 1;
                }

                parentMap[pId].splits.push({
                    _id: child._id,
                    qty: childQty,
                    carat: childCarat,
                    rate: child.sale_rate || 0,
                    amount: amount,
                    date: child.sold_at || child.createdAt,
                    status: child.status,
                    isWeightPending: isWeightPending,
                    payment_status: child.farmer_payment_status || 'Pending' // ✅ Include payment status
                });
            });

            // Compute display_status and filter for Partial
            const partialRecords = [];
            allParentRecords.forEach(record => {
                const data = parentMap[record._id.toString()];
                if (data) {
                    record.aggregated_sold_qty = data.soldQty;
                    record.aggregated_sold_carat = data.soldCarat;
                    record.aggregated_sale_amount = data.totalSaleAmount;
                    record.child_count = data.childCount;
                    record.sold_count = data.soldCount;
                    record.splits = data.splits;

                    const totalSold = record.sale_unit === 'carat' ? data.soldCarat : data.soldQty;
                    record.aggregated_avg_rate = totalSold > 0 ? (data.totalSaleAmount / totalSold) : 0;

                    record.awaiting_qty = (record.quantity || 0) - data.soldQty;
                    record.awaiting_carat = (record.carat || 0) - data.soldCarat;

                    // Add weight pending data to record
                    record.weight_pending_qty = data.weightPendingQty;
                    record.weight_pending_carat = data.weightPendingCarat;
                    record.weight_pending_count = data.weightPendingCount;

                    // ✅ Compute Aggregated Payment Status
                    // If any sold split is 'Pending', the whole lot is considered 'Payment Pending'
                    const soldSplits = data.splits.filter(s => ['Sold', 'Completed'].includes(s.status));
                    const hasUnpaid = soldSplits.some(s => s.payment_status === 'Pending');
                    record.aggregated_payment_status = hasUnpaid ? 'Pending' : 'Paid';

                    // Determine display_status based on sold quantity AND weight pending
                    const totalQty = record.quantity || 0;
                    const totalCarat = record.carat || 0;
                    const hasWeightPending = data.weightPendingQty > 0.01 || data.weightPendingCarat > 0.01;
                    const hasSoldSomething = data.soldQty > 0.01 || data.soldCarat > 0.01;
                    const hasRemaining = (totalQty > 0 && (data.soldQty + data.weightPendingQty) < totalQty - 0.01) ||
                        (totalCarat > 0 && (data.soldCarat + data.weightPendingCarat) < totalCarat - 0.01);

                    // Priority: WeightPending > Partial > Sold > Pending
                    if (hasWeightPending && !hasSoldSomething) {
                        // Only weight pending items, nothing actually sold yet
                        record.display_status = 'WeightPending';
                    } else if (hasWeightPending && hasSoldSomething) {
                        // Mix of weight pending and sold = still show WeightPending (more urgent)
                        record.display_status = 'WeightPending';
                    } else if (hasSoldSomething && hasRemaining) {
                        // Some sold, some remaining = Partial
                        record.display_status = 'Partial';
                        partialRecords.push(record);
                    } else if (hasSoldSomething && !hasRemaining) {
                        // All sold = Sold
                        record.display_status = 'Sold';
                    } else {
                        // Nothing sold yet = Pending
                        record.display_status = 'Pending';
                    }
                }
            });

            // Apply pagination to filtered results
            const totalRecords = partialRecords.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const paginatedRecords = partialRecords.slice(skip, skip + limit);

            return res.json({
                records: paginatedRecords,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    limit
                }
            });
        }

        // Normal flow for non-Partial filters
        // Get total count for pagination metadata
        const totalRecords = await Record.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limit);

        // Get all records for this farmer (paginated)
        const records = await Record.find(query)
            .populate('farmer_id', 'full_name phone farmerId')
            .select('-trader_id -trader_payment_ref -trader_payment_mode -trader_payment_status -net_receivable_from_trader -trader_commission')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Use lean for better performance


        // For parent records (is_parent: true), aggregate data from child records
        const parentIds = records.filter(r => r.is_parent).map(r => r._id);

        if (parentIds.length > 0) {
            // Fetch ALL child records for these parents
            const childRecords = await Record.find({
                parent_record_id: { $in: parentIds },
                status: { $in: ['Sold', 'Completed', 'RateAssigned', 'Weighed'] }
            }).sort({ createdAt: 1 }); // Sort by time

            // Group children by parent and calculate aggregates
            const parentMap = {};

            childRecords.forEach(child => {
                const pId = child.parent_record_id.toString();
                if (!parentMap[pId]) {
                    parentMap[pId] = {
                        splits: [],
                        soldQty: 0,
                        soldCarat: 0,
                        totalSaleAmount: 0,
                        childCount: 0,
                        soldCount: 0,
                        weightPendingQty: 0,
                        weightPendingCarat: 0,
                        weightPendingCount: 0
                    };
                }

                // Check if this is a weight pending item (RateAssigned with no official weight)
                const isWeightPending = child.status === 'RateAssigned' &&
                    (child.official_qty || 0) === 0 && (child.official_carat || 0) === 0;

                // For weight pending items, use allocated qty; for sold items, use official qty
                const childQty = isWeightPending
                    ? (child.allocated_qty || child.quantity || 0)  // Allocated for weight pending
                    : (child.official_qty || child.quantity || 0);  // Official for sold
                const childCarat = isWeightPending
                    ? (child.allocated_carat || child.carat || 0)
                    : (child.official_carat || child.carat || 0);
                const amount = child.sale_amount || child.total_amount || 0;

                if (isWeightPending) {
                    // Track weight pending separately
                    parentMap[pId].weightPendingQty += childQty;
                    parentMap[pId].weightPendingCarat += childCarat;
                    parentMap[pId].weightPendingCount += 1;
                } else {
                    // Only count as sold if actually weighed
                    parentMap[pId].soldQty += childQty;
                    parentMap[pId].soldCarat += childCarat;
                    parentMap[pId].totalSaleAmount += amount;
                }
                parentMap[pId].childCount += 1;

                if (['Sold', 'Completed'].includes(child.status)) {
                    parentMap[pId].soldCount += 1;
                }

                // Add to splits details
                parentMap[pId].splits.push({
                    _id: child._id,
                    qty: childQty,
                    carat: childCarat,
                    rate: child.sale_rate || 0,
                    amount: amount,
                    date: child.sold_at || child.createdAt,
                    status: child.status,
                    isWeightPending: isWeightPending,
                    payment_status: child.farmer_payment_status || 'Pending' // ✅ Include payment status
                });
            });

            // Enhance parent records
            records.forEach(record => {
                if (record.is_parent) {
                    const data = parentMap[record._id.toString()];
                    if (data) {
                        record.aggregated_sold_qty = data.soldQty;
                        record.aggregated_sold_carat = data.soldCarat;
                        record.aggregated_sale_amount = data.totalSaleAmount;
                        record.child_count = data.childCount;
                        record.sold_count = data.soldCount;
                        record.splits = data.splits; // New field

                        // Calculate average rate if needed (total amount / total sold)
                        const totalSold = record.sale_unit === 'carat' ? data.soldCarat : data.soldQty;
                        record.aggregated_avg_rate = totalSold > 0 ? (data.totalSaleAmount / totalSold) : 0;

                        // Calculate awaiting
                        record.awaiting_qty = (record.quantity || 0) - data.soldQty;
                        record.awaiting_carat = (record.carat || 0) - data.soldCarat;

                        // Add weight pending data to record
                        record.weight_pending_qty = data.weightPendingQty;
                        record.weight_pending_carat = data.weightPendingCarat;
                        record.weight_pending_count = data.weightPendingCount;

                        // ✅ Compute Aggregated Payment Status
                        // If any sold split is 'Pending', the whole lot is considered 'Payment Pending'
                        const soldSplits = data.splits.filter(s => ['Sold', 'Completed'].includes(s.status));
                        const hasUnpaid = soldSplits.some(s => s.payment_status === 'Pending');
                        record.aggregated_payment_status = hasUnpaid ? 'Pending' : 'Paid';

                        // Determine display_status based on sold quantity AND weight pending
                        const totalQty = record.quantity || 0;
                        const totalCarat = record.carat || 0;
                        const hasWeightPending = data.weightPendingQty > 0.01 || data.weightPendingCarat > 0.01;
                        const hasSoldSomething = data.soldQty > 0.01 || data.soldCarat > 0.01;
                        const hasRemaining = (totalQty > 0 && (data.soldQty + data.weightPendingQty) < totalQty - 0.01) ||
                            (totalCarat > 0 && (data.soldCarat + data.weightPendingCarat) < totalCarat - 0.01);

                        // Priority: WeightPending > Partial > Sold > Pending
                        if (hasWeightPending && !hasSoldSomething) {
                            // Only weight pending items, nothing actually sold yet
                            record.display_status = 'WeightPending';
                        } else if (hasWeightPending && hasSoldSomething) {
                            // Mix of weight pending and sold = still show WeightPending (more urgent)
                            record.display_status = 'WeightPending';
                        } else if (hasSoldSomething && hasRemaining) {
                            record.display_status = 'Partial';
                        } else if (hasSoldSomething && !hasRemaining) {
                            record.display_status = 'Sold';
                        } else {
                            record.display_status = 'Pending';
                        }
                    } else {
                        // Parent with no children sold yet
                        record.splits = [];
                        record.awaiting_qty = record.quantity;
                        record.awaiting_carat = record.carat;
                        record.display_status = 'Pending';
                    }
                }
            });
        }

        res.json({
            records,
            pagination: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Fetch my records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});
/**
 * GET /api/records/my-stats
 * Fetch global statistics for the logged-in farmer
 * Aggregates data across ALL records (not just paginated ones)
 */
router.get('/my-stats', requireAuth, async (req, res) => {
    try {
        const farmerId = req.user._id;

        const stats = await Record.aggregate([
            { $match: { farmer_id: farmerId } }, // Match all records for this farmer
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['Sold', 'Completed']] },
                                '$sale_amount',
                                0
                            ]
                        }
                    },
                    totalVolume: { $sum: '$quantity' },
                    totalSalesCount: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['Sold', 'Completed']] },
                                1,
                                0
                            ]
                        }
                    },
                    pendingLotsCount: {
                        $sum: {
                            // Count pending if status is Pending OR (Split Lot Parent and display_status is Pending)
                            // Since display_status is computed, we rely on core status 'Pending'
                            // For accuracy with split lots, we simply count 'Pending' records
                            $cond: [
                                { $eq: ['$status', 'Pending'] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : { totalEarnings: 0, totalVolume: 0, totalSalesCount: 0, pendingLotsCount: 0 };

        res.json(result);
    } catch (error) {
        console.error('Fetch stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * GET /api/records/download-report
 * Download full sales history as CSV for Farmer
 */
router.get('/download-report', requireAuth, async (req, res) => {
    try {
        const farmerId = req.user._id;

        // Fetch ALL Sold/Completed records for this farmer
        // Exclude parent records to avoid duplication (show actual sales)
        const records = await Record.find({
            farmer_id: farmerId,
            status: { $in: ['Sold', 'Completed'] },
            is_parent: { $ne: true }
        })
            .sort({ sold_at: -1 })
            .populate('trader_id', 'full_name business_name');

        const formattedRecords = records.map(record => {
            const date = record.sold_at ? new Date(record.sold_at) : new Date(record.createdAt);

            // Determine payment status
            const payStatus = record.farmer_payment_status || (record.payment_status === 'paid' ? 'Paid' : 'Pending');

            return {
                date: date.toLocaleDateString('en-IN'),
                time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                crop: record.vegetable,
                qty: record.official_qty || record.quantity || 0,
                carat: record.official_carat || record.carat || 0,
                rate: record.sale_rate || 0,
                amount: record.sale_amount || 0,
                commission: record.farmer_commission || 0,
                net_payable: record.net_payable_to_farmer || ((record.sale_amount || 0) - (record.farmer_commission || 0)),
                // trader: record.trader_id?.business_name || record.trader_id?.full_name || 'Unknown', // REMOVED PRIVACY
                status: record.status,
                payment_status: payStatus
            };
        });

        const { Parser } = await import('json2csv');

        const fields = [
            { label: 'Date', value: 'date' },
            { label: 'Time', value: 'time' },
            { label: 'Crop', value: 'crop' },
            { label: 'Quantity (kg)', value: 'qty' },
            { label: 'Carat', value: 'carat' },
            { label: 'Rate/kg', value: 'rate' },
            { label: 'Sale Amount', value: 'amount' },
            { label: 'Commission', value: 'commission' },
            { label: 'Net Payable', value: 'net_payable' },
            // { label: 'Trader', value: 'trader' }, // REMOVED
            { label: 'Payment Status', value: 'payment_status' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedRecords);

        res.header('Content-Type', 'text/csv');
        // Sanitized filename
        const safeName = req.user.full_name ? req.user.full_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'farmer';
        res.header('Content-Disposition', `attachment; filename=farmer_report_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

/**
 * GET /api/records/my-purchases
 * Fetch all purchases for the logged-in trader
 * PRIVACY: Exclude farmer details
 * Supports pagination
 */
router.get('/my-purchases', requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;

        const query = { trader_id: req.user._id, status: { $in: ['Sold', 'Completed'] } };

        const [records, total] = await Promise.all([
            Record.find(query)
                .select('-farmer_id -farmer_payment_ref -farmer_payment_mode -farmer_payment_status -net_payable_to_farmer -farmer_commission')
                .sort({ sold_at: -1 })
                .skip(skip)
                .limit(limitNum),
            Record.countDocuments(query)
        ]);

        res.json({
            data: records,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasMore: pageNum * limitNum < total
        });
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

        // AUDIT LOG: Track payment status change
        await createAuditLog({
            user: req.user,
            action: 'update',
            entityType: 'payment',
            entityId: record._id,
            description: AuditDescriptions.paymentStatus(type, status, type === 'farmer' ? 'Farmer' : 'Trader'),
            changes: { [updateField]: { old: 'Pending', new: status }, mode, ref },
            ipAddress: getClientIp(req)
        });

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
 * Also includes parent records that have remaining quantity to sell (partial sales)
 */
router.get('/pending/:farmerId', requireAuth, async (req, res) => {
    try {
        const { farmerId } = req.params;

        // Get regular pending records (not split/child records)
        const pendingRecords = await Record.find({
            farmer_id: farmerId,
            status: 'Pending',
            parent_record_id: { $exists: false } // Exclude child records
        }).sort({ createdAt: -1 }).lean();

        // Get parent records that might have remaining quantity
        const parentRecords = await Record.find({
            farmer_id: farmerId,
            is_parent: true
        }).lean();

        // For each parent record, calculate remaining quantity from children
        const enrichedParentRecords = [];
        for (const parent of parentRecords) {
            // Get child records for this parent
            const children = await Record.find({ parent_record_id: parent._id });

            // Calculate sold quantity and find previous rate
            // Calculate sold quantity and find previous rate
            let soldQty = 0;
            let soldCarat = 0;
            let prevRate = 0;
            const splits = []; // New: Collect split details
            let totalAmountSum = 0; // New: Sum of all amounts

            for (const child of children) {
                // Include RateAssigned and Weighed as 'sold'/allocated so they don't show up as pending
                if (['Sold', 'Completed', 'RateAssigned', 'Weighed'].includes(child.status)) {
                    const childQty = child.official_qty || child.quantity || 0;
                    const childCarat = child.official_carat || child.carat || 0;

                    soldQty += childQty;
                    soldCarat += childCarat;

                    // Capture rate from first sold child to lock it for subsequent splits (legacy behavior, kept for reference)
                    if (!prevRate && child.sale_rate) {
                        prevRate = child.sale_rate;
                    }

                    // Add to splits array
                    splits.push({
                        _id: child._id,
                        qty: childQty,
                        carat: childCarat,
                        rate: child.sale_rate || 0,
                        amount: child.sale_amount || child.total_amount || 0, // Fallback
                        date: child.sold_at || child.createdAt,
                        trader: child.trader_id, // Will be populated if available
                        status: child.status
                    });

                    totalAmountSum += (child.sale_amount || child.total_amount || 0);
                }
            }

            // Calculate remaining
            const remainingQty = (parent.quantity || 0) - soldQty;
            const remainingCarat = (parent.carat || 0) - soldCarat;

            // Only include if there's remaining quantity to sell
            if (remainingQty > 0.01 || remainingCarat > 0.01) {
                enrichedParentRecords.push({
                    ...parent,
                    remaining_qty: parseFloat(remainingQty.toFixed(2)),
                    remaining_carat: parseFloat(remainingCarat.toFixed(2)),
                    sold_qty: parseFloat(soldQty.toFixed(2)),
                    sold_carat: parseFloat(soldCarat.toFixed(2)),
                    has_remaining: true,
                    prev_rate: prevRate, // Send previous rate to frontend
                    splits: splits, // New: Send split details
                    total_amount_sum: totalAmountSum // New: Total amount
                });
            }
        }

        // Combine both lists
        const allRecords = [...pendingRecords, ...enrichedParentRecords];

        res.json(allRecords);
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
            sale_unit: (item.carat && item.carat > 0) ? 'carat' : 'kg',
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

        // Fetch all records for this farmer (exclude parent records)
        const records = await Record.find({
            farmer_id: farmerId,
            is_parent: { $ne: true } // Exclude parent records, show only actual sales
        })
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
 * Assign Rate and Trader(s) (Committee Step 1)
 * Supports multiple trader allocations - creates split records
 * Moves Status: Pending -> RateAssigned
 */
router.patch('/:id/sell', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { allocations, sale_unit, trader_id, sale_rate } = req.body;

        console.log('=== SELL ENDPOINT CALLED ===');
        console.log('Record ID:', id);
        console.log('Allocations:', JSON.stringify(allocations, null, 2));
        console.log('Sale Unit:', sale_unit);

        // Get the original record
        const record = await Record.findById(id);

        if (!record) {
            console.log('ERROR: Record not found');
            return res.status(404).json({ error: 'Record not found' });
        }

        console.log('Record found:', record.lot_id, 'Status:', record.status);

        // Allow 'Pending', 'Weighed', or 'RateAssigned' records to be assigned a rate
        // Exception: Parent records that are 'Completed' (split lots) can still be sold if they have remaining quantity
        const allowedStatuses = ['Pending', 'Weighed', 'RateAssigned'];
        if (record.is_parent) allowedStatuses.push('Completed');

        if (!allowedStatuses.includes(record.status)) {
            console.log('ERROR: Invalid status', record.status);
            return res.status(400).json({ error: `Record status is ${record.status}. Must be Pending or Weighed to assign rate.` });
        }

        // Check if we have multiple allocations (new multi-trader flow)
        if (allocations && Array.isArray(allocations) && allocations.length > 0) {
            console.log('Multi-trader flow detected with', allocations.length, 'allocations');
            // Multi-trader allocation flow

            let alreadySold = 0;
            // If it's already a parent record, subtract what's already been sold to child records
            if (record.is_parent) {
                const existingChildren = await Record.find({ parent_record_id: record._id });
                for (const child of existingChildren) {
                    if (['Sold', 'Completed', 'RateAssigned', 'Weighed'].includes(child.status)) {
                        // This `alreadySold` is a bit ambiguous as it doesn't specify unit.
                        // It's used in the `availableKg` and `availableCarat` calculations below
                        // with an `approx check`. This might need refinement if `alreadySold`
                        // needs to be unit-specific. For now, keeping it as is from the original context.
                        const childQty = (child.official_qty || child.quantity || child.official_carat || child.carat || 0);
                        alreadySold += childQty;
                    }
                }
            }

            // Calculate availability for BOTH units
            const availableKg = (record.official_qty || record.quantity || 0) -
                (record.sale_unit === 'kg' && record.is_parent ? alreadySold : 0); // Approx check for alreadySold

            const availableCarat = (record.official_carat || record.carat || 0) -
                (record.sale_unit === 'carat' && record.is_parent ? alreadySold : 0);

            // Determine intention
            const totalAllocated = allocations.reduce((sum, a) => sum + parseFloat(a.quantity || 0), 0);

            // Initial assumption from request or record
            let targetUnit = sale_unit || (availableCarat > 0 ? 'carat' : 'kg');
            let totalAvailable = targetUnit === 'carat' ? availableCarat : availableKg;

            // SMART FIX: If selected unit has 0 availability (or less than allocated) BUT other unit has enough
            // explicitly switch to the other unit.
            // This handles mismatch where frontend sends 'carat' but we only have 'kg', or vice versa.
            if (totalAvailable < totalAllocated) {
                const otherUnit = targetUnit === 'carat' ? 'kg' : 'carat';
                const otherAvailable = targetUnit === 'carat' ? availableKg : availableCarat;

                console.log(`Mismatch detected! Requested ${targetUnit} (${totalAvailable}) < Allocated (${totalAllocated}). Checking ${otherUnit} (${otherAvailable})...`);

                if (otherAvailable >= totalAllocated - 0.01) {
                    console.log(`Substituted unit to ${otherUnit} to allow sale.`);
                    targetUnit = otherUnit;
                    totalAvailable = otherAvailable;
                }
            }

            const isCarat = targetUnit === 'carat';

            // Use small epsilon for floating point comparison
            if (totalAllocated > totalAvailable + 0.01) {
                console.error(`FAIL: Allocated ${totalAllocated} > Available ${totalAvailable} (${targetUnit})`);
                return res.status(400).json({
                    error: `Total allocated (${totalAllocated}) exceeds available quantity (${parseFloat(totalAvailable.toFixed(2))})`
                });
            }

            // Ensure parent record has a lot_id
            let parentLotId = record.lot_id;
            if (!parentLotId) {
                const currentYear = new Date().getFullYear();
                const count = await Record.countDocuments();
                parentLotId = `LOT-${currentYear}-${(count + 1).toString().padStart(3, '0')}`;
                record.lot_id = parentLotId;
                console.log('Generated parent lot_id:', parentLotId);
            }

            // Create child records for each allocation
            const createdRecords = [];
            // isCarat is already determined above

            for (let i = 0; i < allocations.length; i++) {
                const allocation = allocations[i];

                // Generate unique lot_id for this child using timestamp to ensure uniqueness
                const suffix = String.fromCharCode(65 + i); // A, B, C, etc.
                const timestamp = Date.now();
                const childLotId = `${parentLotId}-${suffix}-${timestamp}`;

                console.log(`Creating child record ${i}: lot_id=${childLotId}, trader=${allocation.trader_id}, qty=${allocation.quantity}`);

                // Create a new child record for this trader
                // NOTE: official_qty and official_carat are left as 0 - weight staff will fill them
                const childRecord = new Record({
                    farmer_id: record.farmer_id,
                    vegetable: record.vegetable,
                    market: record.market,
                    quantity: isCarat ? 0 : parseFloat(allocation.quantity), // Estimated/allocated qty
                    carat: isCarat ? parseFloat(allocation.quantity) : 0,
                    // official_qty/official_carat left as default 0 - to be filled by weight staff
                    allocated_qty: isCarat ? 0 : parseFloat(allocation.quantity),
                    allocated_carat: isCarat ? parseFloat(allocation.quantity) : 0,
                    trader_id: allocation.trader_id,
                    sale_rate: parseFloat(allocation.rate),
                    sale_unit: targetUnit,
                    status: 'RateAssigned',
                    parent_record_id: record._id,
                    is_parent: false,
                    lot_id: childLotId // Set lot_id here so pre-save hook skips
                });

                try {
                    await childRecord.save();
                    console.log(`Child record ${i} saved successfully`);
                } catch (saveError) {
                    console.error('Error saving child record:', saveError.message);
                    console.error('Full error:', saveError);
                    throw saveError;
                }

                // Populate trader info for response
                await childRecord.populate('trader_id', 'full_name phone business_name');
                createdRecords.push(childRecord);
            }

            // Mark the parent record as split and completed
            record.is_parent = true;
            record.status = 'Completed';
            await record.save();

            // AUDIT LOG: Track lilav entry
            await createAuditLog({
                user: req.user,
                action: 'create',
                entityType: 'lilav',
                entityId: record._id,
                description: AuditDescriptions.createLilav(
                    record.farmer_id?.full_name || 'Farmer',
                    record.vegetable,
                    `${allocations.length} traders`,
                    allocations.reduce((sum, a) => sum + (parseFloat(a.quantity) * parseFloat(a.rate)), 0)
                ),
                changes: { allocations: allocations.length, traders: allocations.map(a => a.trader_id) },
                ipAddress: getClientIp(req)
            });

            res.json({
                message: `Lot split successfully among ${allocations.length} traders`,
                parentRecord: record,
                childRecords: createdRecords
            });

        } else {
            // Legacy single-trader flow (backward compatible)
            if (!trader_id || sale_rate == null) {
                return res.status(400).json({ error: 'Trader and sale rate required' });
            }

            const updatedRecord = await Record.findByIdAndUpdate(
                id,
                {
                    trader_id,
                    sale_rate,
                    sale_unit: sale_unit || 'kg',
                    status: 'RateAssigned',
                },
                { new: true }
            )
                .populate('farmer_id', 'full_name phone')
                .populate('trader_id', 'full_name phone business_name');

            res.json(updatedRecord);
        }
    } catch (error) {
        console.error('Assign rate error:', error);
        res.status(500).json({ error: 'Failed to assign rate' });
    }
});

/**
 * GET /api/records/completed
 * Get completed sales (transaction history)
 * Excludes parent records (only shows actual trader assignments)
 * Supports pagination and search
 */
router.get('/completed', requireAuth, async (req, res) => {
    try {
        const { date, page = 1, limit = 50, search, paymentStatus } = req.query;

        let query = {
            status: { $in: ['Sold', 'Completed'] },
            is_parent: { $ne: true } // Exclude parent records (split lots)
        };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.sold_at = { $gte: startDate, $lte: endDate };
        }

        // Payment status filter
        if (paymentStatus && paymentStatus !== 'all') {
            query.payment_status = paymentStatus;
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;

        // Build aggregation pipeline for search across populated fields
        let pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'farmer_id',
                    foreignField: '_id',
                    as: 'farmer_id'
                }
            },
            { $unwind: { path: '$farmer_id', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'trader_id',
                    foreignField: '_id',
                    as: 'trader_id'
                }
            },
            { $unwind: { path: '$trader_id', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sold_by',
                    foreignField: '_id',
                    as: 'sold_by'
                }
            },
            { $unwind: { path: '$sold_by', preserveNullAndEmptyArrays: true } },
        ];

        // Add search filter if provided
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'farmer_id.full_name': { $regex: search, $options: 'i' } },
                        { 'trader_id.full_name': { $regex: search, $options: 'i' } },
                        { 'trader_id.business_name': { $regex: search, $options: 'i' } },
                        { vegetable: { $regex: search, $options: 'i' } }
                    ]
                }
            });
        }

        // Get total count
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Record.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Add sorting, skip, limit
        pipeline.push(
            { $sort: { sold_at: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $project: {
                    _id: 1,
                    farmer_id: { _id: 1, full_name: 1, phone: 1 },
                    trader_id: { _id: 1, full_name: 1, phone: 1, business_name: 1 },
                    sold_by: { _id: 1, full_name: 1 },
                    vegetable: 1,
                    quantity: 1,
                    carat: 1,
                    official_qty: 1,
                    official_carat: 1,
                    sale_rate: 1,
                    sale_amount: 1,
                    farmer_commission: 1,
                    trader_commission: 1,
                    net_payable_to_farmer: 1,
                    net_receivable_from_trader: 1,
                    status: 1,
                    payment_status: 1,
                    farmer_payment_status: 1,
                    trader_payment_status: 1,
                    sold_at: 1,
                    createdAt: 1
                }
            }
        );

        const records = await Record.aggregate(pipeline);

        res.json({
            data: records,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasMore: pageNum * limitNum < total
        });
    } catch (error) {
        console.error('Fetch completed records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

export default router;
