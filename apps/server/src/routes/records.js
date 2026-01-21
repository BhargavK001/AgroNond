import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// FARMER ROUTES
// ==========================================

/**
 * GET /api/records/my-records
 * Fetch all records for the logged-in farmer
 */
router.get('/my-records', requireAuth, requireRole('farmer'), async (req, res) => {
  try {
    // ✅ FIX: Initialize Supabase here, not at the top level
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('farmer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

/**
 * POST /api/records
 * Farmer adds a new vegetable lot
 */
router.post('/', requireAuth, requireRole('farmer'), async (req, res) => {
  try {
    const supabase = getSupabaseAdmin(); // ✅ FIX
    const { market, vegetable, quantity } = req.body;

    if (!market || !vegetable || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const { data, error } = await supabase
      .from('records')
      .insert([
        {
          farmer_id: req.user.id,
          market,
          vegetable,
          quantity,
          status: 'Pending',
          official_qty: null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// ==========================================
// WEIGHT STAFF / COMMITTEE ROUTES
// ==========================================

/**
 * GET /api/records/pending/:farmerId
 * Fetch pending lots for a specific farmer
 */
router.get('/pending/:farmerId', requireAuth, requireRole('weight', 'committee', 'admin'), async (req, res) => {
  try {
    const supabase = getSupabaseAdmin(); // ✅ FIX
    const { farmerId } = req.params;

    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending records' });
  }
});

/**
 * PUT /api/records/weigh/:id
 * Update the official weight of a record
 */
router.put('/weigh/:id', requireAuth, requireRole('weight', 'committee', 'admin'), async (req, res) => {
  try {
    const supabase = getSupabaseAdmin(); // ✅ FIX
    const { id } = req.params;
    const { official_qty } = req.body;

    if (!official_qty) {
      return res.status(400).json({ error: 'Official quantity is required' });
    }

    const { data, error } = await supabase
      .from('records')
      .update({
        official_qty,
        status: 'Weighed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating weight:', error);
    res.status(500).json({ error: 'Failed to update weight' });
  }
});

export default router;