import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Record from '../apps/server/src/models/Record.js';
import User from '../apps/server/src/models/User.js';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../apps/server/.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const debugRecords = async () => {
    await connectDB();

    try {
        const totalRecords = await Record.countDocuments();
        const recordsWithTraderId = await Record.countDocuments({ trader_id: { $exists: true, $ne: null } });
        const recordsWithTraderString = await Record.countDocuments({ trader: { $exists: true, $ne: "" } });

        console.log(`Total Records: ${totalRecords}`);
        console.log(`Records with trader_id (ObjectId): ${recordsWithTraderId}`);
        console.log(`Records with trader (String): ${recordsWithTraderString}`);

        // Sample record
        const sample = await Record.findOne({ trader_id: { $exists: true } }).populate('trader_id');
        if (sample) {
            console.log('\nSample Record with trader_id:');
            console.log(JSON.stringify(sample, null, 2));
        } else {
            console.log('\nNo record with trader_id found.');
            const stringSample = await Record.findOne({ trader: { $exists: true, $ne: "" } });
            if (stringSample) {
                console.log('\nSample Record with trader string only:');
                console.log(JSON.stringify(stringSample, null, 2));
            }
        }

        // Check a specific trader if needed (Devcode)
        // We can't know the ID easily without searching by name
        const devcodeTrader = await User.findOne({ business_name: /Devcode/i });
        if (devcodeTrader) {
            console.log(`\nFound Trader "Devcode": ${devcodeTrader._id}`);
            const count = await Record.countDocuments({ trader_id: devcodeTrader._id });
            console.log(`Records linked to Devcode (${devcodeTrader._id}): ${count}`);
        } else {
            console.log('\nTrader "Devcode" not found in Users collection.');
        }

    } catch (error) {
        console.error('Debug script error:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugRecords();
