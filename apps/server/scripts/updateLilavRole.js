// Script to update user role to 'lilav'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agronond';

async function updateUserRole() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update user with phone 1111111111 to lilav role
        const result = await mongoose.connection.db.collection('users').updateOne(
            { phone: '+911111111111' },
            { $set: { role: 'lilav' } }
        );

        if (result.matchedCount === 0) {
            // Try without +91 prefix
            const result2 = await mongoose.connection.db.collection('users').updateOne(
                { phone: '1111111111' },
                { $set: { role: 'lilav' } }
            );

            if (result2.matchedCount === 0) {
                console.log('No user found with phone 1111111111');
            } else {
                console.log('Successfully updated user role to lilav!');
            }
        } else {
            console.log('Successfully updated user role to lilav!');
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
}

updateUserRole();
