import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    bill_number: {
        type: String,
        unique: true,
        sparse: true
    },
    bill_for: {
        type: String,
        enum: ['farmer', 'trader'],
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    record_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true
    },
    // Produce details
    vegetable: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    // Financial details
    base_amount: {
        type: Number,
        required: true
    },
    commission_rate: {
        type: Number,
        required: true
    },
    commission_amount: {
        type: Number,
        required: true
    },
    final_amount: {
        type: Number,
        required: true
    },
    // Payment tracking
    payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    payment_mode: {
        type: String,
        enum: ['cash', 'cheque', 'upi', 'bank', ''],
        default: ''
    },
    payment_date: {
        type: Date
    },
    payment_reference: {
        type: String,
        default: ''
    },
    // Metadata
    market: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Pre-save hook to generate bill_number
billSchema.pre('save', async function () {
    if (!this.isNew || this.bill_number) {
        return;
    }

    const currentYear = new Date().getFullYear();
    const prefix = this.bill_for === 'farmer' ? 'FB' : 'TB';
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const count = await this.constructor.countDocuments({
        bill_for: this.bill_for,
        createdAt: { $gte: startOfYear, $lte: endOfYear }
    });

    const sequenceNumber = (count + 1).toString().padStart(5, '0');
    this.bill_number = `${prefix}-${currentYear}-${sequenceNumber}`;
});

const Bill = mongoose.model('Bill', billSchema);

export default Bill;
