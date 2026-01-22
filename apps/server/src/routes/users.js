import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      user: {
        id: req.user.id,
        phone: req.user.phone,
        email: req.user.email,
      },
      profile,
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
    const { role, full_name } = req.body;
    const supabase = getSupabaseAdmin();
    
    const updateData = {};
    if (role) updateData.role = role;
    if (full_name) updateData.full_name = full_name;
    updateData.updated_at = new Date().toISOString();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Profile update error:', error);
      return res.status(400).json({ error: 'Failed to update profile' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/users/set-role
 * Set user role (one-time during onboarding)
 */
router.post('/set-role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const supabase = getSupabaseAdmin();
    
    const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight_staff', 'accounting'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
    }
    
    // Check if user already has a role
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();
    
    if (existingProfile?.role) {
      return res.status(400).json({ 
        error: 'Role already set',
        currentRole: existingProfile.role
      });
    }
    
    // Set the role
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Set role error:', error);
      return res.status(400).json({ error: 'Failed to set role' });
    }
    
    res.json({ 
      message: 'Role set successfully',
      profile 
    });
  } catch (error) {
    console.error('Set role error:', error);
    res.status(500).json({ error: 'Failed to set role' });
  }
});

export default router;
