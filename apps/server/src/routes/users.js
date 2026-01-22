import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // req.user is already populated by middleware
    const user = req.user;

    // Return unified user object
    res.json({
      user: {
        id: user._id,
        phone: user.phone,
        email: user.email, // If we have email
      },
      profile: user, // In Mongo model, user and profile are same document
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PATCH /api/users/profile
 * Update current user's profile
 */
router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { role, full_name, business_name, gst_number, license_number, business_address, operating_locations } = req.body;

    const user = req.user;

    if (role) user.role = role;
    if (full_name) user.full_name = full_name;
    if (business_name) user.business_name = business_name;
    if (gst_number) user.gst_number = gst_number;
    if (license_number) user.license_number = license_number;
    if (business_address) user.business_address = business_address;
    if (operating_locations) user.operating_locations = operating_locations;

    await user.save();

    res.json({ profile: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/users/set-role
 * Set user role (one-time during onboarding)
 */
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

    // Check if user already has a role
    const user = req.user;

    if (user.role) {
      return res.status(400).json({
        error: 'Role already set',
        currentRole: user.role
      });
    }

    // Set the role
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
