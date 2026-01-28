import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://bhargavk056_db_user:CohFAW3E6QTgKa8s@agronond.onv9buu.mongodb.net/?appName=AgroNond';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Minimal schemas
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
}, { strict: false });
const Record = mongoose.model('Record', recordSchema);

const debugQuery = async () => {
    await connectDB();

    try {
        // Find ALL users matching "Devcode"
        const traderUsers = await User.find({ business_name: /Devcode/i });

        if (traderUsers.length === 0) {
            console.log('Trader "Devcode" not found!');
            return;
        }

        console.log(`Found ${traderUsers.length} Users matching "Devcode":`);

        for (const user of traderUsers) {
            const count = await Record.countDocuments({ trader_id: user._id });
            console.log(`User: ${user.business_name} (ID: ${user._id}) - Records: ${count}`);
        }

    } catch (error) {
        console.error('Debug script error:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugQuery();
