
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Record from './src/models/Record.js';
import dotenv from 'dotenv';
dotenv.config();

const calculateSale = (record, qty, carat) => {
    let sale_amount = 0;
    if (record.sale_unit === 'carat') {
        sale_amount = carat * record.sale_rate;
    } else {
        sale_amount = qty * record.sale_rate;
    }

    const farmer_commission = Math.round(sale_amount * 0.04);
    const trader_commission = Math.round(sale_amount * 0.09);

    return {
        sale_amount,
        farmer_commission,
        trader_commission,
        commission: farmer_commission + trader_commission,
        net_payable_to_farmer: sale_amount - farmer_commission,
        net_receivable_from_trader: sale_amount + trader_commission,
        total_amount: sale_amount + trader_commission,
        status: 'Sold', // This is what we expect
        sold_at: new Date(),
        sold_by: record.sold_by,
        farmer_payment_status: 'Pending',
        trader_payment_status: 'Pending'
    };
};

async function runTest() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Setup Data
        const farmer = await User.findOne({ role: 'farmer' }) || await User.create({ phone: '+919999999999', role: 'farmer', full_name: 'Test Farmer' });
        const trader = await User.findOne({ role: 'trader' }) || await User.create({ phone: '+918888888888', role: 'trader', full_name: 'Test Trader' });

        // 2. Farmer Creates Record
        console.log('Step 1: Farmer creates record (Pending)');
        let record = await Record.create({
            farmer_id: farmer._id,
            vegetable: 'Tomato',
            market: 'Test Market',
            quantity: 100, // Est
            status: 'Pending'
        });
        console.log('Record Created:', record._id, record.status);

        // 3. Lilav (Committee) Assigns Rate
        console.log('Step 2: Lilav Assigns Rate (Pending -> RateAssigned)');
        // Simulate PATCH /sell logic
        record.trader_id = trader._id;
        record.sale_rate = 20; // 20 Rs/kg
        record.sale_unit = 'kg';
        record.status = 'RateAssigned';
        await record.save();
        console.log('Record Updated:', record.status, 'Rate:', record.sale_rate);

        // 4. Weight (Finalize)
        console.log('Step 3: Weight (RateAssigned -> Sold)');
        // Simulate POST /record logic
        const official_qty = 105;
        const official_carat = 0;

        record.official_qty = official_qty;
        record.official_carat = official_carat;
        record.weighed_at = new Date();

        if (record.status === 'RateAssigned') {
            const saleData = calculateSale(record, official_qty, official_carat);
            Object.assign(record, saleData);
        }
        await record.save();

        console.log('Record Final State:', record.status);
        console.log('Sale Amount:', record.sale_amount, '(Expected: 105 * 20 = 2100)');
        console.log('Farmer Net:', record.net_payable_to_farmer);
        console.log('Trader Due:', record.net_receivable_from_trader);

        if (record.status === 'Sold' && record.sale_amount === 2100) {
            console.log('✅ VERIFICATION SUCCESS');
        } else {
            console.error('❌ VERIFICATION FAILED');
        }

        // Cleanup
        await Record.findByIdAndDelete(record._id);
        if (farmer.phone === '+919999999999') await User.findByIdAndDelete(farmer._id);
        if (trader.phone === '+918888888888') await User.findByIdAndDelete(trader._id);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
