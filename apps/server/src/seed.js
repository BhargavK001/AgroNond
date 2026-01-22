import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Record from './models/Record.js';

// Setup dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from parent directory (server root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('Clearing Users collection...');
        await User.deleteMany({});
        console.log('Cleared Users.');

        console.log('Clearing Records collection...');
        try {
            // Dynamic import to avoid error if model issues exist, or just import at top if confident. 
            // Using top import is better. 
        } catch (e) { }
        // actually I will just add the import at the top and use it here.
        await Record.deleteMany({});
        console.log('Cleared Records.');

        const usersToSeed = [
            {
                phone: '0000000000',
                role: 'committee',
                full_name: 'Market Committee Test',
            },
            {
                phone: '1111111111',
                role: 'accounting',
                full_name: 'Accounting Test',
            },
            {
                phone: '2222222222',
                role: 'weight', // 'weight' is the role key used in Frontend based on previous context
                full_name: 'Weight Staff Test',
            },
            {
                phone: '3333333333',
                role: 'farmer',
                full_name: 'Farmer Test',
            },
            {
                phone: '4444444444',
                role: 'trader',
                full_name: 'Trader Test',
            },
            {
                phone: '9999999999',
                role: 'admin',
                full_name: 'System Admin',
            },
        ];

        console.log('Seeding users...');
        await User.insertMany(usersToSeed);
        console.log('Seeding complete!');
        console.log('-----------------------------------');
        usersToSeed.forEach(u => {
            console.log(`${u.role.padEnd(12)}: ${u.phone}`);
        });
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
};

seedUsers();
