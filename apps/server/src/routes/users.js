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
      location: user.location,
      photo: user.profile_picture,
      initials: user.initials,

      // IDs
      farmerId: user.farmerId,
      weightId: user.role === 'weight' ? user.customId : undefined, // <--- Send customId as weightId
      customId: user.customId 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    // ✅ Extract 'name' and 'photo' which the Frontend sends
    const { 
        role, full_name, name, // Frontend sends 'name'
        email, location, 
        profile_picture, photo, // Frontend sends 'photo'
        business_name, gst_number, license_number, business_address, operating_locations, adhaar_number 
    } = req.body;

    const user = req.user; 

    // Update User Fields
    if (role) user.role = role;
    
    // Handle Name Update (accept either 'full_name' or 'name')
    const newName = full_name || name;
    if (newName) {
      user.full_name = newName;
      // Auto-generate initials
      const nameParts = newName.trim().split(' ');
      if (nameParts.length >= 2) {
        user.initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        user.initials = nameParts[0].slice(0, 2).toUpperCase();
      }
    }

    if (email) user.email = email;
    if (location) user.location = location;
    
    // Handle Photo Update (accept either 'profile_picture' or 'photo')
    if (profile_picture || photo) user.profile_picture = profile_picture || photo;
    
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
        weightId: user.role === 'weight' ? user.customId : undefined, // <--- Return updated ID
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

// ... existing /set-role route ...
router.post('/set-role', requireAuth, async (req, res) => {
    try {
      const { role } = req.body;
  
      const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight', 'lilav'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          validRoles
        });
      }
  
      const user = req.user;
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