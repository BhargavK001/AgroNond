import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('--- MongoDB Connection Verification ---');
console.log(`URI: ${MONGO_URI}`);

async function verifyConnection() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ SUCCESS: Connected to MongoDB successfully.');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('--- Collections ---');
        if (collections.length === 0) {
            console.log('No collections found (database might be new).');
        } else {
            collections.forEach(c => console.log(`- ${c.name}`));
        }

        await mongoose.disconnect();
        console.log('--- Disconnected ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR: Failed to connect to MongoDB.');
        console.error(error);
        process.exit(1);
    }
}

verifyConnection();
