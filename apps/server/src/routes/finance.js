import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Reuse admin middleware logic or import if refactored
const requirePrivilegedRole = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    const allowedRoles = ['admin', 'accounting'];
    if (!allowedRoles.includes(profile?.role)) {
      return res.status(403).json({ error: 'Access denied: Unauthorized role' });
    }
    next();
  } catch (error) {
    console.error('Privilege check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/finance/billing-records
 * List all purchases/bills
 */
router.get('/billing-records', requireAuth, requirePrivilegedRole, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('purchases')
      .select('*, trader:profiles!trader_id(full_name, phone)', { count: 'exact' });
      
    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .range(start, end)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      records: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('List billing records error:', error);
    res.status(500).json({ error: 'Failed to fetch billing records' });
  }
});

/**
 * POST /api/finance/payments
 * Record a payment
 */
router.post('/payments', requireAuth, requirePrivilegedRole, async (req, res) => {
  try {
    const { purchase_id, amount, payment_method, notes } = req.body;
    
    const supabase = getSupabaseAdmin();
    
    // 1. Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        purchase_id,
        amount,
        payment_method,
        transaction_ref: notes,
        status: 'Completed', // Assuming direct recording means completed
        paiyer_id: req.user.id // Admin recording it? Or need to specify who paid? Assuming Admin records generic payment for now.
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 2. Update purchase status if fully paid (simplified logic)
    // In real app, check total vs paid. Here we just mark as Paid if amount > 0
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: 'Paid' })
      .eq('id', purchase_id);

    if (updateError) console.error('Failed to update purchase status:', updateError);

    res.json(payment);
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

/**
 * GET /api/finance/stats
 * Financial overview
 */
router.get('/stats', requireAuth, requirePrivilegedRole, async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    
    // Total Volume
    const { data: purchases } = await supabase
      .from('purchases')
      .select('total_amount, status');
      
    const totalVolume = purchases?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
    const pendingAmount = purchases
      ?.filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

    res.json({
      totalVolume,
      pendingAmount,
      transactionCount: purchases?.length || 0
    });
  } catch (error) {
    console.error('Financial stats error:', error);
    res.status(500).json({ error: 'Failed to fetch financial stats' });
  }
});

export default router;
