import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Map Backend Database fields -> Frontend State fields
    res.json({
        id: user._id,
        phone: user.phone,
        role: user.role,
        // Profile Data
        name: user.full_name,
        farmerId: user.farmerId,
        location: user.location,
        photo: user.profile_picture, // Frontend expects 'photo', DB has 'profile_picture'
        initials: user.initials
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    // 1. Destructure ALL possible fields from the request
    const { 
        name, 
        location, 
        photo, 
        initials,
        // Existing trader fields (keep them so nothing breaks)
        role, business_name, gst_number, license_number, business_address, operating_locations 
    } = req.body;

    const user = req.user; // This comes from requireAuth middleware

    // 2. Update Farmer Fields
    if (name) user.full_name = name;
    if (location) user.location = location;
    if (photo !== undefined) user.profile_picture = photo;
    if (initials) user.initials = initials;

    // 3. Update Trader/Role Fields (Existing logic)
    if (role) user.role = role;
    if (business_name) user.business_name = business_name;
    if (gst_number) user.gst_number = gst_number;
    if (license_number) user.license_number = license_number;
    if (business_address) user.business_address = business_address;
    if (operating_locations) user.operating_locations = operating_locations;

    // 4. Save to Database
    await user.save();
    res.json({
        user: {
            name: user.full_name,
            phone: user.phone,
            location: user.location,
            farmerId: user.farmerId,
            photo: user.profile_picture,
            initials: user.initials,
            role: user.role
        }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

router.post('/set-role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;

    const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight', 'accounting'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        validRoles
      });
    }

    const user = req.user;

    if (user.role && user.role !== 'farmer') {
       // Optional: Allow changing from default 'farmer' but restrict others if needed
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Role set successfully',
      profile: user
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Failed to set role' });
  }
});

export default router;