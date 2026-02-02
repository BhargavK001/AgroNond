import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Require admin role
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied: Admin access required' });
    }
};

/**
 * GET /api/admin/audit-logs
 * Get audit logs with pagination and filters
 * Admin only
 */
router.get('/audit-logs', requireAuth, requireAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            entity_type,
            action,
            user_id,
            start_date,
            end_date,
            search
        } = req.query;

        // Build filter
        const filter = {};

        if (entity_type) {
            filter.entity_type = entity_type;
        }

        if (action) {
            filter.action = action;
        }

        if (user_id) {
            filter.user_id = user_id;
        }

        // Date range filter
        if (start_date || end_date) {
            filter.timestamp = {};
            if (start_date) {
                filter.timestamp.$gte = new Date(start_date);
            }
            if (end_date) {
                filter.timestamp.$lte = new Date(end_date);
            }
        }

        // Search by description or user name
        if (search) {
            filter.$or = [
                { description: { $regex: search, $options: 'i' } },
                { user_name: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.json({
            logs,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            hasMore: skip + logs.length < total
        });
    } catch (error) {
        console.error('Fetch audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * GET /api/admin/audit-logs/summary
 * Get audit log summary (counts by type, recent activity)
 * Admin only
 */
router.get('/audit-logs/summary', requireAuth, requireAdmin, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalLogs,
            todayLogs,
            byEntityType,
            byAction,
            recentUsers
        ] = await Promise.all([
            AuditLog.countDocuments(),
            AuditLog.countDocuments({ timestamp: { $gte: today } }),
            AuditLog.aggregate([
                { $group: { _id: '$entity_type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 } } }
            ]),
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: today } } },
                {
                    $group: {
                        _id: '$user_id',
                        user_name: { $first: '$user_name' },
                        user_role: { $first: '$user_role' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.json({
            totalLogs,
            todayLogs,
            byEntityType,
            byAction,
            recentActiveUsers: recentUsers
        });
    } catch (error) {
        console.error('Fetch audit summary error:', error);
        res.status(500).json({ error: 'Failed to fetch audit summary' });
    }
});

export default router;
