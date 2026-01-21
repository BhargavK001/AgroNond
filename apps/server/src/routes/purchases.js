import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Get all purchases
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('purchases')
      .select('*')
      .eq('trader_id', req.user.id)
      .order('purchase_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['Pending', 'Paid', 'Overdue'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      purchases: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();

    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('quantity, rate, total_amount, commission_rate, status')
      .eq('trader_id', req.user.id);

    if (error) throw error;

    const commissionRate = 0.09;

    const stats = {
      totalPurchases: purchases.length,
      totalQuantity: purchases.reduce((sum, p) => sum + parseFloat(p.quantity || 0), 0),
      totalBaseAmount: purchases.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0),
      totalCommission: 0,
      totalSpent: 0,
      pendingPayments: 0,
      paidAmount: 0,
      overdueAmount: 0
    };

    stats.totalCommission = stats.totalBaseAmount * commissionRate;
    stats.totalSpent = stats.totalBaseAmount + stats.totalCommission;

    purchases.forEach(p => {
      const amount = parseFloat(p.total_amount || 0) * (1 + commissionRate);
      if (p.status === 'Pending') stats.pendingPayments += amount;
      else if (p.status === 'Paid') stats.paidAmount += amount;
      else if (p.status === 'Overdue') stats.overdueAmount += amount;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get single purchase
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Purchase not found' });
      }
      throw error;
    }

    res.json({ purchase: data });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

// Create purchase
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { farmer_name, crop, quantity, rate, farmer_id, notes, purchase_date } = req.body;

    if (!farmer_name || !crop || !quantity || !rate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['farmer_name', 'crop', 'quantity', 'rate']
      });
    }

    if (quantity <= 0 || rate <= 0) {
      return res.status(400).json({ error: 'Quantity and rate must be positive numbers' });
    }

    const { data, error } = await supabase
      .from('purchases')
      .insert({
        trader_id: req.user.id,
        farmer_id,
        farmer_name,
        crop,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        notes,
        purchase_date: purchase_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Purchase created successfully',
      purchase: data
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Update purchase
router.patch('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { status, rate, notes, farmer_name, crop, quantity } = req.body;

    const updateData = {};
    if (status && ['Pending', 'Paid', 'Overdue'].includes(status)) updateData.status = status;
    if (rate && rate > 0) updateData.rate = parseFloat(rate);
    if (notes !== undefined) updateData.notes = notes;
    if (farmer_name) updateData.farmer_name = farmer_name;
    if (crop) updateData.crop = crop;
    if (quantity && quantity > 0) updateData.quantity = parseFloat(quantity);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Purchase not found' });
      }
      throw error;
    }

    res.json({
      message: 'Purchase updated successfully',
      purchase: data
    });
  } catch (error) {
    console.error('Update purchase error:', error);
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// Delete purchase
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id)
      .eq('trader_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

export default router;
