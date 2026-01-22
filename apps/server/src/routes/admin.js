import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware to require admin role
const requireAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/admin/metrics
 * Get system-wide metrics (User counts)
 */
router.get('/metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get counts for different roles
    // We can run these in parallel
    const [
      { count: totalFarmers, error: farmersError },
      { count: totalTraders, error: tradersError },
      { count: totalUsers, error: usersError }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'trader'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    if (farmersError) throw farmersError;
    if (tradersError) throw tradersError;
    if (usersError) throw usersError;

    res.json({
      totalFarmers: totalFarmers || 0,
      totalTraders: totalTraders || 0,
      totalUsers: totalUsers || 0,
      activeToday: 0 // Placeholder as we don't have login tracking yet
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});



/**
 * GET /api/admin/users
 * List all users with pagination and filtering
 */
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('GET /api/admin/users hit');
    const { role, page = 1, limit = 20 } = req.query;
    console.log('Params:', { role, page, limit });
    
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });
      
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    console.log(`Found ${count} users`);
    
    res.json({
      users: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
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
    const validRoles = ['farmer', 'trader', 'committee', 'admin', 'weight_staff', 'accounting'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
