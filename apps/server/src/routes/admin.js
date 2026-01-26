import express from 'express';
import User from '../models/User.js';
import Record from '../models/Record.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }
};

/**
 * GET /api/admin/metrics
 * Get system-wide metrics (User counts & aggregated Record stats)
 */
router.get('/metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalFarmers,
      totalTraders,
      totalUsers,
      pendingWeights,
      activeAuctions, // "Weighed" status means ready for auction
      completedToday
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'trader' }),
      User.countDocuments({}),
      Record.countDocuments({ status: 'Pending' }),
      Record.countDocuments({ status: 'Weighed' }),
      Record.countDocuments({
        status: { $in: ['Sold', 'Completed'] },
        updatedAt: { $gte: today }
      })
    ]);

    // Financial aggregation for "Total Volume" (All time)
    const financialStats = await Record.aggregate([
      { $match: { status: { $in: ['Sold', 'Completed'] } } },
      { $group: { _id: null, totalVolume: { $sum: '$sale_amount' }, totalCommission: { $sum: '$commission' } } }
    ]);

    const totalVolume = financialStats[0]?.totalVolume || 0;
    const totalCommission = financialStats[0]?.totalCommission || 0;

    res.json({
      totalFarmers,
      totalTraders,
      totalUsers,
      totalVolume,
      totalCommission,
      pendingWeights,
      activeAuctions,
      completedToday
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/admin/farmers
 * List all farmers with details
 */
router.get('/farmers', requireAuth, requireAdmin, async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(farmers);
  } catch (error) {
    console.error('Fetch farmers error:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

/**
 * GET /api/admin/traders
 * List all traders with details
 */
router.get('/traders', requireAuth, requireAdmin, async (req, res) => {
  try {
    const traders = await User.find({ role: 'trader' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(traders);
  } catch (error) {
    console.error('Fetch traders error:', error);
    res.status(500).json({ error: 'Failed to fetch traders' });
  }
});

/**
 * GET /api/admin/weight-records
 * Fetch all weight records (Pending & Weighed)
 */
router.get('/weight-records', requireAuth, requireAdmin, async (req, res) => {
  try {
    const records = await Record.find({})
      .populate('farmer_id', 'full_name farmerId phone')
      .populate('weighed_by', 'full_name') // Staff who weighed it
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent 100 for performance
    res.json(records);
  } catch (error) {
    console.error('Fetch weight records error:', error);
    res.status(500).json({ error: 'Failed to fetch weight records' });
  }
});

/**
 * GET /api/admin/lilav-bids
 * Fetch all auction activity (Sold/Completed records)
 */
router.get('/lilav-bids', requireAuth, requireAdmin, async (req, res) => {
  try {
    const records = await Record.find({ status: { $in: ['Sold', 'Completed'] } })
      .populate('farmer_id', 'full_name farmerId')
      .populate('trader_id', 'full_name customId business_name')
      .populate('sold_by', 'full_name') // Auctioneer/Staff
      .sort({ sold_at: -1 })
      .limit(100);
    res.json(records);
  } catch (error) {
    console.error('Fetch lilav bids error:', error);
    res.status(500).json({ error: 'Failed to fetch auction records' });
  }
});

/**
 * GET /api/admin/committee-records
 * Fetch financial/commission records
 */
router.get('/committee-records', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Return all completed sales with commission details
    const records = await Record.find({ status: { $in: ['Sold', 'Completed'] } })
      .populate('farmer_id', 'full_name farmerId')
      .populate('trader_id', 'full_name customId business_name')
      .select('commission total_amount sale_amount vegetable market createdAt sold_at')
      .sort({ sold_at: -1 })
      .limit(100);

    res.json(records);
  } catch (error) {
    console.error('Fetch committee records error:', error);
    res.status(500).json({ error: 'Failed to fetch committee records' });
  }
});

/**
 * GET /api/admin/users
 * List all users with pagination and filtering (Generic User Management)
 */
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
router.patch('/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight', 'lilav', 'accounting'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * POST /api/admin/users
 * Create a new user (Admin only)
 */
router.post('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { phone, role, full_name } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone and role are required' });
    }

    const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight', 'lilav', 'accounting'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    const newUser = await User.create({
      phone,
      role,
      full_name: full_name || '',
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * GET /api/admin/commission-rules
 * Get commission rules
 */
router.get('/commission-rules', requireAuth, requireAdmin, async (req, res) => {
  // Return mock rules for now until DB model is ready
  res.json([
    { id: '1', cropType: 'Wheat', percentage: 2.5, minAmount: 100 },
    { id: '2', cropType: 'Rice', percentage: 2.0, minAmount: 0 },
    { id: '3', cropType: 'Corn', percentage: 1.5, minAmount: 50 }
  ]);
});

export default router;
