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
    email: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    profile_picture: {
        type: String, // Base64 or URL
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
    customId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
});

// Pre-save hook to generate customId
// Pre-save hook to generate customId
userSchema.pre('save', async function () {
    if (!this.isNew || this.customId) {
        return;
    }

    // Define prefixes for roles
    const prefixes = {
        admin: 'ADM',
        trader: 'TRD',
        committee: 'MCDB',
        lilav: 'LLV',
    };

    const prefix = prefixes[this.role];

    // If role doesn't have a prefix (e.g., farmer, weight), skip ID generation
    if (!prefix) {
        return;
    }

    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

        // Count documents created in the current year with the same role
        const count = await this.constructor.countDocuments({
            role: this.role,
            createdAt: { $gte: startOfYear, $lte: endOfYear }
        });

        // Format: PREFIX-YYYY-NNN (e.g., TRD-2026-001)
        const sequenceNumber = (count + 1).toString().padStart(3, '0');
        this.customId = `${prefix}-${currentYear}-${sequenceNumber}`;

    } catch (error) {
        throw error;
    }
});

const User = mongoose.model('User', userSchema);

export default User;
