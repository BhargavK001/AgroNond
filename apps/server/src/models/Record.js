import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
    farmer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vegetable: {
        type: String,
        required: true
    },
    quantity: {
        type: Number, // Estimated quantity
        default: 0
    },
    official_qty: {
        type: Number, // Measured weight
        default: 0
    },
    market: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Weighed', 'Completed'],
        default: 'Pending'
    },
    weighed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    weighed_at: {
        type: Date
    },
    // Sale/Auction fields
    trader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sale_rate: {
        type: Number,
        default: 0
    },
    sale_amount: {
        type: Number,
        default: 0
    },
    sold_at: {
        type: Date
    },
    sold_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    payment_status: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'pending'
    },
    lot_id: {
        type: String,
        unique: true,
        sparse: true
    },
    commission: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save hook to generate lot_id
recordSchema.pre('save', async function () {
    if (!this.isNew || this.lot_id) {
        return;
    }

    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

        const count = await this.constructor.countDocuments({
            createdAt: { $gte: startOfYear, $lte: endOfYear }
        });

        const sequenceNumber = (count + 1).toString().padStart(3, '0');
        this.lot_id = `LOT-${currentYear}-${sequenceNumber}`;
    } catch (error) {
        throw error;
    }
});

const Record = mongoose.model('Record', recordSchema);

export default Record;
