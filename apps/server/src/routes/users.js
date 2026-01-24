import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users (with optional filtering)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { role, search } = req.query;

    // Build query
    const query = {};

    // Filter by role if provided
    if (role) {
      query.role = role;
    }

    // Search by name or phone if provided
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { business_name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 }); // Newest first

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

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

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { role, full_name, email, location, profile_picture, business_name, gst_number, license_number, business_address, operating_locations, adhaar_number } = req.body;

    const user = req.user;

    if (role) user.role = role;
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (location) user.location = location;
    if (profile_picture) user.profile_picture = profile_picture;
    if (business_name) user.business_name = business_name;
    if (gst_number) user.gst_number = gst_number;
    if (license_number) user.license_number = license_number;
    if (business_address) user.business_address = business_address;
    if (operating_locations) user.operating_locations = operating_locations;
    if (adhaar_number) user.adhaar_number = adhaar_number;

    await user.save();

    res.json({ profile: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      error: 'Failed to update profile',
      details: error.message
    });
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
