import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Record from '../models/Record.js';
import connectDB from '../config/db.js';

dotenv.config();

console.log('--- Starting Verification Script ---');

const runDebug = async () => {
    await connectDB();

    try {
        // Find a trader with 'Sold' records
        const sample = await Record.findOne({
            status: 'Sold',
            trader_id: { $exists: true }
        }).lean();

        if (!sample) {
            console.log('No Sold records with trader_id found for verification.');
            process.exit(0);
        }

        const traderId = sample.trader_id;
        console.log('Testing with Trader ID:', traderId);

        // Simulate the NEW aggregation pipeline
        const pipeline = [
            {
                $match: {
                    trader_id: new mongoose.Types.ObjectId(traderId),
                    status: { $in: ['Sold', 'Completed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$official_qty' },
                    totalBaseSpend: { $sum: '$sale_amount' },
                    totalCommission: { $sum: '$commission' },
                }
            }
        ];

        console.log('Running Fixed Pipeline...');
        const stats = await Record.aggregate(pipeline);
        console.log('Aggregation Result:', JSON.stringify(stats, null, 2));

        if (stats.length > 0 && stats[0].count > 0) {
            console.log('\nSUCCESS: Aggregation now finds records!');
        } else {
            console.log('\nFAILURE: Aggregation still returns nothing.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
        process.exit();
    }
};

runDebug();
