import express from 'express';
import Record from '../models/Record.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/weight/stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [completed, pending, todayRecs] = await Promise.all([
            Record.countDocuments({ status: { $in: ['Weighed', 'Completed', 'Sold'] } }),
            Record.countDocuments({ status: 'Pending' }),
            Record.countDocuments({
                updatedAt: { $gte: today, $lt: tomorrow },
                status: { $in: ['Weighed', 'Completed', 'Sold'] }
            })
        ]);

        res.json({ completed, pending, today: todayRecs });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/weight/records (The main list)
router.get('/records', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({ status: { $in: ['Weighed', 'Completed', 'Sold'] } })
            .populate('farmer_id', 'farmerId full_name phone')
            .sort({ updatedAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Fetch records error:', error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});

// GET /api/weight/pending (For dropdown)
router.get('/pending', requireAuth, async (req, res) => {
    try {
        const records = await Record.find({ status: 'Pending' })
            .populate('farmer_id', 'farmerId full_name phone')
            .sort({ createdAt: -1 });
        res.json(records);
    } catch (error) {
        console.error('Pending records error:', error);
        res.status(500).json({ error: 'Failed to fetch pending records' });
    }
});

// POST /api/weight/record (Add/Update)
router.post('/record', requireAuth, async (req, res) => {
    try {
        const { recordRefId, farmerId, item, estWeight, updatedWeight, date } = req.body;

        let record;

        if (recordRefId) {
            // Updating existing pending record
            record = await Record.findById(recordRefId);
            if (!record) return res.status(404).json({ error: 'Record not found' });

            record.official_qty = updatedWeight;
            record.status = updatedWeight ? 'Weighed' : 'Pending';
            record.weighed_by = req.user._id;
            record.weighed_at = new Date();
            if (date) {
                // If checking date, we might want to update createdAt or create a separate date field
                // For now, let's respect the user's manual date entry if provided
                // record.createdAt = new Date(date); 
            }

            await record.save();
        } else {
            // Creating new manual record
            let farmerObjectId = farmerId;
            // If it's a string looking like an ID but not an ObjectId? 
            // The frontend sends `formData.farmerId`. If from dropdown, it might be ID.
            // If manual entry, it might be the farmerId string (e.g. FRM-...).

            // Check if valid ObjectId
            const isValidObjectId = (id) => id.match(/^[0-9a-fA-F]{24}$/);

            if (!isValidObjectId(farmerId)) {
                // Try to find by custom ID
                const f = await User.findOne({ farmerId: farmerId });
                if (f) farmerObjectId = f._id;
                else return res.status(400).json({ error: 'Invalid Farmer ID' });
            }

            record = new Record({
                farmer_id: farmerObjectId,
                vegetable: item,
                quantity: estWeight || 0,
                official_qty: updatedWeight || 0,
                status: updatedWeight ? 'Weighed' : 'Pending',
                weighed_by: req.user._id,
                weighed_at: new Date(),
                market: 'Manual',
            });
            if (date) record.createdAt = new Date(date);
            await record.save();
        }
        res.json(record);
    } catch (e) {
        console.error('Save record error:', e);
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/weight/record/:id (Update existing weight record)
router.put('/record/:id', requireAuth, async (req, res) => {
    try {
        const { updatedWeight } = req.body;
        const record = await Record.findByIdAndUpdate(req.params.id, {
            official_qty: updatedWeight,
            status: updatedWeight ? 'Weighed' : 'Pending',
            weighed_by: req.user._id,
            weighed_at: new Date()
        }, { new: true });
        res.json(record);
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// DELETE /api/weight/record/:id
router.delete('/record/:id', requireAuth, async (req, res) => {
    try {
        await Record.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// GET /api/weight/profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('full_name phone location initials customId');
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'Profile fetch error' });
    }
});

// PUT /api/weight/profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, phone, location } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.full_name = name;
        user.phone = phone;
        user.location = location;

        await user.save(); // Triggers customId generation if missing

        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'Profile update error' });
    }
});

export default router;
