import express from 'express';
import User from '../models/User.js';
import Record from '../models/Record.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/search
 * @desc Universal search across Users and Records with role-based scoping
 * @access Private
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ farmers: [], traders: [], records: [] });
        }

        const role = req.user.role;
        const userId = req.user.id; // User's MongoDB _id
        const userCustomId = req.user.customId; // User's custom ID (e.g. TRD-2026-001)

        // Regex for partial case-insensitive match
        const searchRegex = new RegExp(q, 'i');

        const results = {
            farmers: [],
            traders: [],
            records: []
        };

        // --- 1. Define Search Queries Based on Role ---

        // COMMITTEE / ADMIN: Can see everything
        if (role === 'committee' || role === 'admin') {
            // Search Farmers
            results.farmers = await User.find({
                role: 'farmer',
                $or: [
                    { full_name: searchRegex },
                    { phone: searchRegex },
                    { farmerId: searchRegex },
                    { customId: searchRegex }
                ]
            }).select('full_name phone farmerId role _id').limit(5);

            // Search Traders
            results.traders = await User.find({
                role: 'trader',
                $or: [
                    { full_name: searchRegex },
                    { business_name: searchRegex },
                    { customId: searchRegex },
                    { phone: searchRegex }
                ]
            }).select('full_name business_name customId role _id').limit(5);

            // Search Records
            results.records = await Record.find({
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex },
                    { market: searchRegex }
                ]
            })
                .populate('farmer_id', 'full_name farmerId')
                .populate('trader_id', 'full_name business_name')
                .sort({ createdAt: -1 })
                .limit(5);
        }

        // TRADER: Can see their own transactions, their own profile match (sanity check), and farmers they've dealt with (optional - keeping simple for now)
        else if (role === 'trader') {
            // Can search for farmers (global list often public in mandis, or restricted? Assuming global farmer search is useful for traders)
            // Let's restrict to ONLY Farmers for now as they need to find farmers to buy from
            results.farmers = await User.find({
                role: 'farmer',
                $or: [
                    { full_name: searchRegex },
                    { farmerId: searchRegex }
                ]
            }).select('full_name phone farmerId role _id').limit(5);

            // Search ONLY their own records
            results.records = await Record.find({
                trader_id: userId, // Strict Filter: Only this trader's records
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex },
                    { market: searchRegex }
                ]
            })
                .populate('farmer_id', 'full_name farmerId')
                .sort({ createdAt: -1 })
                .limit(5);
        }

        // FARMER: Can see only their own records
        else if (role === 'farmer') {
            results.records = await Record.find({
                farmer_id: userId, // Strict Filter: Only this farmer's records
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex },
                    { market: searchRegex }
                ]
            })
                .populate('trader_id', 'full_name business_name')
                .sort({ createdAt: -1 })
                .limit(5);
        }

        // LILAV (Auctioneer): Needs to see records available for auction (usually pending or weighed)
        else if (role === 'lilav') {
            results.records = await Record.find({
                // Lilav primarily searches for records to auction
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex }
                ]
            })
                .populate('farmer_id', 'full_name farmerId')
                .sort({ createdAt: -1 })
                .limit(10);

            // Can also search farmers to identify lots
            results.farmers = await User.find({
                role: 'farmer',
                $or: [
                    { full_name: searchRegex },
                    { farmerId: searchRegex }
                ]
            }).select('full_name farmerId role _id').limit(5);
        }

        // WEIGHT: Needs to see records to weigh
        else if (role === 'weight') {
            results.records = await Record.find({
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex }
                ]
            })
                .populate('farmer_id', 'full_name farmerId')
                .sort({ createdAt: -1 })
                .limit(10);

            results.farmers = await User.find({
                role: 'farmer',
                $or: [
                    { full_name: searchRegex },
                    { farmerId: searchRegex }
                ]
            }).select('full_name farmerId role _id').limit(5);
        }

        // ACCOUNTING: Similar to Committee, needs broad access
        else if (role === 'accounting') {
            results.records = await Record.find({
                $or: [
                    { lot_id: searchRegex },
                    { vegetable: searchRegex }
                ]
            })
                .populate('farmer_id', 'full_name farmerId')
                .populate('trader_id', 'full_name business_name')
                .sort({ createdAt: -1 })
                .limit(5);

            results.traders = await User.find({
                role: 'trader',
                $or: [
                    { full_name: searchRegex },
                    { business_name: searchRegex },
                    { customId: searchRegex }
                ]
            }).select('full_name business_name customId role _id').limit(5);
        }


        res.json(results);

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
});

export default router;
