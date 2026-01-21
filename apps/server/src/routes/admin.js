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
 * System-wide metrics for dashboard
 */
router.get('/metrics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Parallelize queries for better performance
    const [
      { count: usersCount }, 
      { count: farmersCount }, 
      { count: tradersCount },
      { data: recentExchanges }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'trader'),
      supabase.from('inventory').select('*').limit(5).order('created_at', { ascending: false })
    ]);

    res.json({
      totalUsers: usersCount || 0,
      totalFarmers: farmersCount || 0,
      totalTraders: tradersCount || 0,
      recentActivity: recentExchanges || []
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/admin/configs
 * Get system settings
 */
router.get('/configs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key');
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * POST /api/admin/configs
 * Update system settings
 */
router.post('/configs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const supabase = getSupabaseAdmin();
    
    // Upsert setting
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ 
        key, 
        value, 
        description,
        updated_by: req.user.id,
        updated_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

/**
 * GET /api/admin/commission-rules
 * Get commission rules
 */
router.get('/commission-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('commission_rules')
      .select('*')
      .order('effective_date', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get commission rules error:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

/**
 * POST /api/admin/commission-rules
 * Create new commission rule
 */
router.post('/commission-rules', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { crop_type, role_type, rate } = req.body;
    if (!crop_type || !role_type || rate === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('commission_rules')
      .insert({
        crop_type,
        role_type,
        rate,
        effective_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Create commission rule error:', error);
    res.status(500).json({ error: 'Failed to create rule' });
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
