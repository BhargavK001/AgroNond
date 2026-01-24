import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true, // Phone number is the unique identifier for auth
    },
    role: {
        type: String,
        enum: ['farmer', 'trader', 'committee', 'admin', 'weight', 'lilav'],
        default: 'farmer', // Default to farmer for new public users
    },
    full_name: {
        type: String,
        default: '',
    },
    business_name: {
        type: String,
        default: '',
    },
    gst_number: {
        type: String,
        default: '',
    },
    license_number: {
        type: String,
        default: '',
    },
    business_address: {
        type: String,
        default: '',
    },
    operating_locations: {
        type: [String], // Array of strings
        default: [],
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
