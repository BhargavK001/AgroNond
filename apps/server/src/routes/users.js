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
    const { role, full_name, email, location, profile_picture, business_name, gst_number, license_number, business_address, operating_locations, adhaar_number } = req.body;

    const user = req.user; // This comes from requireAuth middleware

    // Update User Fields
    if (role) user.role = role;
    if (full_name) {
      user.full_name = full_name;
      // Auto-generate initials from full name
      const nameParts = full_name.trim().split(' ');
      if (nameParts.length >= 2) {
        user.initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        user.initials = nameParts[0].slice(0, 2).toUpperCase();
      }
    }
    if (email) user.email = email;
    if (location) user.location = location;
    if (profile_picture) user.profile_picture = profile_picture;
    if (business_name) user.business_name = business_name;
    if (gst_number) user.gst_number = gst_number;
    if (license_number) user.license_number = license_number;
    if (business_address) user.business_address = business_address;
    if (operating_locations) user.operating_locations = operating_locations;
    if (adhaar_number) user.adhaar_number = adhaar_number;

    // Save to Database
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
    res.status(400).json({
      error: 'Failed to update profile',
      details: error.message
    });
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