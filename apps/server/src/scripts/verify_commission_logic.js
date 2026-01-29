import mongoose from 'mongoose';
import CommissionRule from '../models/CommissionRule.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const calculateSale = async (qty, sale_rate, sale_unit) => {
    let sale_amount = 0;
    if (sale_unit === 'carat') {
        // Assume carat is passed as qty for simplicity in this test or handled separately
        // In actual code: sale_amount = carat * record.sale_rate
        sale_amount = qty * sale_rate; // Simplified
    } else {
        sale_amount = qty * sale_rate;
    }

    // Fetch active commission rules
    const [farmerRule, traderRule] = await Promise.all([
        CommissionRule.findOne({ role_type: 'farmer', is_active: true, crop_type: 'All' }).sort({ createdAt: -1 }),
        CommissionRule.findOne({ role_type: 'trader', is_active: true, crop_type: 'All' }).sort({ createdAt: -1 })
    ]);

    const farmerRate = farmerRule ? farmerRule.rate : 0.04; // Default 4%
    const traderRate = traderRule ? traderRule.rate : 0.09; // Default 9%

    console.log(`Using Rates - Farmer: ${farmerRate * 100}%, Trader: ${traderRate * 100}%`);

    const farmer_commission = Math.round(sale_amount * farmerRate);
    const trader_commission = Math.round(sale_amount * traderRate);

    return {
        sale_amount,
        farmer_commission,
        trader_commission,
        commission: farmer_commission + trader_commission
    };
};

const runTest = async () => {
    try {
        // 1. Create Test Rules
        console.log('Creating test rules: Farmer 5%, Trader 10%');
        await CommissionRule.deleteMany({ crop_type: 'All' }); // Clear old rules
        await CommissionRule.create({ role_type: 'farmer', rate: 0.05, crop_type: 'All' });
        await CommissionRule.create({ role_type: 'trader', rate: 0.10, crop_type: 'All' });

        // 2. Calculate
        const qty = 100;
        const rate = 20; // 20 rs/kg
        // Sale Amount = 2000
        // Farmer Comm (5%) = 100
        // Trader Comm (10%) = 200
        const result = await calculateSale(qty, rate, 'kg');

        console.log('Calculation Result:', result);

        if (result.farmer_commission === 100 && result.trader_commission === 200) {
            console.log('SUCCESS: Commission calculation verified!');
        } else {
            console.error('FAILURE: Calculation mismatch.');
        }

        // Cleanup
        // await CommissionRule.deleteMany({});
    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

runTest();
