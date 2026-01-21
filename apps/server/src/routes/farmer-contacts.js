import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Get all farmer contacts
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { search, location, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('farmer_contacts')
      .select('*')
      .eq('trader_id', req.user.id)
      .order('total_transactions', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,primary_crop.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      farmers: data,
      count: data?.length || 0,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get farmer contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch farmer contacts' });
  }
});

// Get single farmer contact
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data, error } = await supabase
      .from('farmer_contacts')
      .select('*')
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Farmer contact not found' });
      }
      throw error;
    }

    res.json({ farmer: data });
  } catch (error) {
    console.error('Get farmer contact error:', error);
    res.status(500).json({ error: 'Failed to fetch farmer contact' });
  }
});

// Add new farmer contact
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { name, phone, location, primary_crop, rating, notes, farmer_profile_id } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name']
      });
    }

    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const { data, error } = await supabase
      .from('farmer_contacts')
      .insert({
        trader_id: req.user.id,
        farmer_profile_id,
        name,
        phone,
        location,
        primary_crop,
        rating: rating || 0,
        notes
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A contact with this phone number already exists' });
      }
      throw error;
    }

    res.status(201).json({
      message: 'Farmer contact added successfully',
      farmer: data
    });
  } catch (error) {
    console.error('Create farmer contact error:', error);
    res.status(500).json({ error: 'Failed to add farmer contact' });
  }
});

// Update farmer contact
router.patch('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { name, phone, location, primary_crop, rating, notes, is_verified } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (primary_crop !== undefined) updateData.primary_crop = primary_crop;
    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5' });
      }
      updateData.rating = rating;
    }
    if (notes !== undefined) updateData.notes = notes;
    if (is_verified !== undefined) updateData.is_verified = is_verified;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('farmer_contacts')
      .update(updateData)
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Farmer contact not found' });
      }
      throw error;
    }

    res.json({
      message: 'Farmer contact updated successfully',
      farmer: data
    });
  } catch (error) {
    console.error('Update farmer contact error:', error);
    res.status(500).json({ error: 'Failed to update farmer contact' });
  }
});

// Update farmer transaction stats
router.patch('/:id/stats', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { transaction_value } = req.body;

    if (!transaction_value || transaction_value <= 0) {
      return res.status(400).json({ error: 'Valid transaction_value is required' });
    }

    const { data: current, error: fetchError } = await supabase
      .from('farmer_contacts')
      .select('total_transactions, total_value')
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('farmer_contacts')
      .update({
        total_transactions: (current.total_transactions || 0) + 1,
        total_value: (parseFloat(current.total_value) || 0) + parseFloat(transaction_value)
      })
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Farmer stats updated',
      farmer: data
    });
  } catch (error) {
    console.error('Update farmer stats error:', error);
    res.status(500).json({ error: 'Failed to update farmer stats' });
  }
});

// Delete farmer contact
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { error } = await supabase
      .from('farmer_contacts')
      .delete()
      .eq('id', id)
      .eq('trader_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Farmer contact removed successfully' });
  } catch (error) {
    console.error('Delete farmer contact error:', error);
    res.status(500).json({ error: 'Failed to remove farmer contact' });
  }
});

export default router;
