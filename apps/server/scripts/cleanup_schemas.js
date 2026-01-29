
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (server root)
dotenv.config({ path: join(__dirname, '../.env') });

const cleanup = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;

        // --- 1. Clean up Users (Farmers) ---
        console.log('Cleaning up User fields...');

        const userFields = [
            'gst_number',
            'license_number',
            'business_name',
            'business_address',

            'profile_picture',
            'email',
            'location'
        ];

        let totalUserMods = 0;

        for (const field of userFields) {
            const result = await db.collection('users').updateMany(
                {
                    role: 'farmer',
                    [field]: "" // Only remove if it is an empty string
                },
                {
                    $unset: { [field]: "" }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`- Removed '${field}' from ${result.modifiedCount} farmers.`);
                totalUserMods += result.modifiedCount;
            }
        }

        // Handle array separately
        const locationResult = await db.collection('users').updateMany(
            {
                role: 'farmer',
                operating_locations: { $size: 0 } // Empty array
            },
            {
                $unset: { operating_locations: "" }
            }
        );
        if (locationResult.modifiedCount > 0) {
            console.log(`- Removed 'operating_locations' from ${locationResult.modifiedCount} farmers.`);
        }


        // --- 2. Clean up Records ---
        console.log('Cleaning up Record fields...');

        const recordFields = [
            'trader', // default: '-'
            'farmer_payment_mode',
            'trader_payment_mode',
            'farmer_payment_ref',
            'trader_payment_ref'
        ];

        for (const field of recordFields) {
            const filter = (field === 'trader') ? { [field]: '-' } : { [field]: "" };

            const result = await db.collection('records').updateMany(
                filter,
                {
                    $unset: { [field]: "" }
                }
            );
            if (result.modifiedCount > 0) {
                console.log(`- Removed '${field}' from ${result.modifiedCount} records.`);
            }
        }

        console.log('Cleanup Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanup();
