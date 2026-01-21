import express from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { status, crop, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('inventory')
      .select('*')
      .eq('trader_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['good', 'low', 'critical'].includes(status)) {
      query = query.eq('status', status);
    }

    if (crop) {
      query = query.ilike('crop', `%${crop}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalStock = data.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
    const totalValue = data.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.price_per_unit || 0)), 0);
    const lowStockItems = data.filter(item => item.status === 'low' || item.status === 'critical').length;

    res.json({
      inventory: data,
      stats: {
        totalItems: data.length,
        totalStock,
        totalValue,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single inventory item
router.get('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      throw error;
    }

    res.json({ item: data });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { 
      crop, 
      batch_id, 
      quantity, 
      max_quantity, 
      unit = 'kg', 
      location, 
      price_per_unit,
      purchase_id 
    } = req.body;

    if (!crop || !batch_id || quantity === undefined || !max_quantity || !price_per_unit) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['crop', 'batch_id', 'quantity', 'max_quantity', 'price_per_unit']
      });
    }

    if (quantity < 0 || max_quantity <= 0 || price_per_unit <= 0) {
      return res.status(400).json({ error: 'Quantity, max_quantity, and price must be positive numbers' });
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        trader_id: req.user.id,
        crop,
        batch_id,
        quantity: parseFloat(quantity),
        max_quantity: parseFloat(max_quantity),
        unit,
        location,
        price_per_unit: parseFloat(price_per_unit),
        purchase_id
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A batch with this ID already exists' });
      }
      throw error;
    }

    res.status(201).json({
      message: 'Inventory item added successfully',
      item: data
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// Update inventory item
router.patch('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { quantity, max_quantity, price_per_unit, location, days_in_storage } = req.body;

    const updateData = {};
    if (quantity !== undefined && quantity >= 0) updateData.quantity = parseFloat(quantity);
    if (max_quantity !== undefined && max_quantity > 0) updateData.max_quantity = parseFloat(max_quantity);
    if (price_per_unit !== undefined && price_per_unit > 0) updateData.price_per_unit = parseFloat(price_per_unit);
    if (location !== undefined) updateData.location = location;
    if (days_in_storage !== undefined) updateData.days_in_storage = parseInt(days_in_storage);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      throw error;
    }

    res.json({
      message: 'Inventory item updated successfully',
      item: data
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Adjust inventory quantity
router.patch('/:id/adjust', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { adjustment, reason } = req.body;

    if (adjustment === undefined || adjustment === 0) {
      return res.status(400).json({ error: 'Adjustment value is required' });
    }

    const { data: current, error: fetchError } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      throw fetchError;
    }

    const newQuantity = parseFloat(current.quantity) + parseFloat(adjustment);
    
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Cannot reduce quantity below 0' });
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .eq('trader_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: `Inventory adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}`,
      item: data
    });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({ error: 'Failed to adjust inventory' });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('trader_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Inventory item removed successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Failed to remove inventory item' });
  }
});

export default router;
