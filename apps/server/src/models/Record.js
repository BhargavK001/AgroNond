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
    market: {
        type: String,
        required: true
    },
    // The quantity farmer says they have (Estimated)
    quantity: {
        type: Number, 
        required: true,
        default: 0
    },
    // The quantity actually sold (confirmed by trader/weight)
    qtySold: {
        type: Number,
        default: 0
    },
    // Financials
    rate: {
        type: Number, // Price per unit
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    // Logistics
    trader: {
        type: String,
        default: '-'
    },
    status: {
        type: String,
        enum: ['Pending', 'Weighed', 'Sold', 'Completed'],
        default: 'Pending'
    },
    // Official weight checks (for Weight Dashboard)
    official_qty: {
        type: Number,
        default: 0
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
    },
    // Commission breakdown fields
    farmer_commission_amount: {
        type: Number,
        default: 0
    },
    farmer_payable_amount: {
        type: Number,
        default: 0
    },
    trader_commission_amount: {
        type: Number,
        default: 0
    },
    trader_receivable_amount: {
        type: Number,
        default: 0
    },
    // Bill references
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    farmer_bill_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
    },
    trader_bill_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill'
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