import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true, // Phone number is the unique identifier for auth
    },
    role: {
        type: String,
        enum: ['farmer', 'trader', 'committee', 'admin', 'weight', 'accounting'],
        default: 'farmer',
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
    location: {
        type: String,
        default: '' 
    },
    initials: {
        type: String,
        default: 'FK' // Default Avatar initials
    },
    // --- NEW: Field to store Profile Photo ---
    profile_picture: {
        type: String, // Stores the Base64 image string
        default: ''
    },

    // --- Trader/Business Specific Fields ---
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
        type: [String],
        default: [],
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
const User = mongoose.model('User', userSchema);

export default User;