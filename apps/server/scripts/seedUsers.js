import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const users = [
    { phone: '1111111111', role: 'committee', full_name: 'Market Committee' },
    { phone: '2222222222', role: 'accounting', full_name: 'Accounting Staff' },
    { phone: '0000000000', role: 'weight', full_name: 'Weight Staff' }, // 'weight_staff' -> 'weight' key in frontend
    { phone: '9999999999', role: 'admin', full_name: 'System Admin' },
    { phone: '9372329075', role: 'farmer', full_name: 'Demo Farmer' },
    { phone: '7777777777', role: 'trader', full_name: 'Demo Trader' }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB...');

        for (const user of users) {
            // Check if user exists
            const existing = await User.findOne({ phone: user.phone });
            if (existing) {
                // Update role if exists
                existing.role = user.role;
                existing.full_name = user.full_name;
                await existing.save();
                console.log(`Updated user: ${user.phone} (${user.role})`);
            } else {
                // Create new
                await User.create(user);
                console.log(`Created user: ${user.phone} (${user.role})`);
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
