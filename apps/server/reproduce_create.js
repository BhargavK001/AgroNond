
import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Test Token Generation
        const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
        console.log('Token generation successful');

        // Test Creating a new user (farmer default)
        const phone = '+919876543210';
        console.log('Attempting to create user with phone:', phone);

        // Cleanup first
        await User.deleteMany({ phone });

        const newUser = await User.create({
            phone
        });

        console.log('Created user:', newUser);

    } catch (error) {
        console.error('Error in testCreate:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testCreate();
