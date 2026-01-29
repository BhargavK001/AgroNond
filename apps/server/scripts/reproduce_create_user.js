
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../src/models/User.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const verify = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);

        const testPhone = '+919999999999';

        // Clean up previous test
        await User.deleteOne({ phone: testPhone });

        console.log('Creating Test Farmer...');
        const user = await User.create({
            phone: testPhone,
            role: 'farmer'
        });

        const userObj = user.toObject();
        console.log('User Created. Checking fields...');

        const forbiddenFields = [
            'gst_number',
            'license_number',
            'business_name',
            'business_address',

            'profile_picture',
            'email',
            'location'
        ];

        let failed = false;
        forbiddenFields.forEach(field => {
            if (userObj.hasOwnProperty(field)) {
                console.error(`FAIL: Field '${field}' exists with value: "${userObj[field]}"`);
                failed = true;
            } else {
                // console.log(`PASS: Field '${field}' is absent.`);
            }
        });

        if (userObj.operating_locations && userObj.operating_locations.length === 0) {
            // In previous run I removed default: [], but mongoose might still init it if defined as array? 
            // Actually without default, it should be undefined unless set.
            // Let's see what happens.
            if (userObj.hasOwnProperty('operating_locations')) {
                console.warn("WARN: 'operating_locations' is present (probably empty array). This might be Mongoose behavior for array types.");
            }
        }


        if (!failed) {
            console.log('SUCCESS: No extra fields found on new Farmer document.');
        } else {
            console.log('FAILURE: Extra fields found.');
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        console.log('Test user deleted.');

        process.exit(failed ? 1 : 0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();
