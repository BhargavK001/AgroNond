import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true, // Phone number is the unique identifier for auth
    },
    role: {
        type: String,
        enum: ['farmer', 'trader', 'committee', 'admin', 'weight', 'lilav', 'accounting'],
        default: 'farmer', // Default to farmer for new public users
    },
    full_name: {
        type: String,
        default: 'Farmer',
    },

    // --- Farmer Specific Fields ---
    farmerId: {
        type: String,
        default: 'AGR-PENDING' // e.g., AGR-1234
    },
    initials: {
        type: String,
        default: 'FK' // Default Avatar initials
    },

    email: {
        type: String,
    },
    location: {
        type: String,
    },
    profile_picture: {
        type: String, // Base64 or URL
    },
    business_name: {
        type: String,
    },
    gst_number: {
        type: String,
    },
    license_number: {
        type: String,
    },
    business_address: {
        type: String,
    },
    adhaar_number: {
        type: String,
    },
    operating_locations: {
        type: [String],
    },
    customId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    timestamps: true,
});
userSchema.pre('save', async function () {
    if (this.role === 'farmer' && (this.farmerId === 'AGR-PENDING' || !this.farmerId)) {
        try {
            const currentYear = new Date().getFullYear();
            const prefix = `FRM-${currentYear}`;
            const lastFarmer = await this.constructor.findOne({
                role: 'farmer',
                farmerId: { $regex: `^${prefix}` }
            }).sort({ createdAt: -1 });

            let nextSequence = 1;

            if (lastFarmer && lastFarmer.farmerId) {
                const parts = lastFarmer.farmerId.split('-');
                const lastSeqNumber = parseInt(parts[2]);

                if (!isNaN(lastSeqNumber)) {
                    nextSequence = lastSeqNumber + 1;
                }
            }
            this.farmerId = `${prefix}-${nextSequence.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error("Error generating Farmer ID:", error);
            throw error;
        }
    }
});
// Pre-save hook to generate customId
userSchema.pre('save', async function () {
    if (!this.isNew || this.customId) {
        return;
    }

    // Define prefixes for roles
    const prefixes = {
        test: 'ACC', // Keeping existing ones
        admin: 'ADM',
        trader: 'TRD',
        committee: 'MCDB',
        lilav: 'LLV',
        accounting: 'ACC',
        weight: 'WT',
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