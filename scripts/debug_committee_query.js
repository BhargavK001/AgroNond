import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Define minimal schemas inline
const userSchema = new mongoose.Schema({
    full_name: String,
    business_name: String,
    role: String
});
const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema({
    trader_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trader: String,
    status: String,
    vegetable: String,
    sale_amount: Number,
    official_qty: Number
}, { strict: false }); // Allow other fields
const Record = mongoose.model('Record', recordSchema);

const debugQuery = async () => {
    await connectDB();

    try {
        // Find the trader "Devcode"
        const traderUser = await User.findOne({ business_name: /Devcode/i });

        if (!traderUser) {
            console.log('Trader "Devcode" not found!');
            // List all traders
            const traders = await User.find({ role: 'trader' }).limit(5);
            console.log('Available Traders:', traders.map(t => `${t.business_name} (${t._id})`));
            return;
        }

        console.log('Found Trader:', {
            id: traderUser._id,
            business: traderUser.business_name,
            name: traderUser.full_name
        });

        const traderId = traderUser._id;

        // Run the exact counts
        const countById = await Record.countDocuments({ trader_id: traderId });
        const countByBusiness = await Record.countDocuments({ trader: traderUser.business_name });
        const countByName = await Record.countDocuments({ trader: traderUser.full_name });
        const countByStringId = await Record.countDocuments({ trader_id: traderId.toString() }); // Check if stored as string

        console.log('DEBUG Record Counts:', {
            countById,
            countByBusiness,
            countByName,
            countByStringId
        });

        // Check Status distribution for this trader
        const statusDist = await Record.aggregate([
            { $match: { trader_id: traderId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        console.log('Status Distribution (by ID):', statusDist);

        if (statusDist.length === 0) {
            console.log('No records found matching ID. Checking by business name...');
            const statusDistName = await Record.aggregate([
                { $match: { trader: traderUser.business_name } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);
            console.log('Status Distribution (by Business Name):', statusDistName);
        }

    } catch (error) {
        console.error('Debug script error:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugQuery();
