
import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testVerify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const phone = '+919999999999';

        // Simulate the logic in auth.js
        const rawPhone = phone.replace(/^\+91/, '');
        console.log('Searching for users with phone:', phone, rawPhone);

        const users = await User.find({
            $or: [
                { phone: phone },
                { phone: rawPhone },
                { phone: `+91${rawPhone}` }
            ]
        });

        console.log('Found users:', users.length);
        users.forEach(u => console.log(`- ${u.phone} (${u.role})`));

        // Smart selection priority
        const rolePriority = { 'admin': 6, 'committee': 5, 'weight': 4, 'accounting': 3, 'trader': 2, 'farmer': 1 };

        let user = null;
        if (users.length > 0) {
            user = users.sort((a, b) => (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0))[0];
        } else {
            console.log('No user found');
        }

        if (user) {
            console.log('Selected user:', user);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testVerify();
