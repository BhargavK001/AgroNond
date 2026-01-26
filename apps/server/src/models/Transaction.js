import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    transaction_number: {
        type: String,
        unique: true,
        sparse: true
    },
    record_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record',
        required: true
    },
    farmer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    // Financial calculations
    base_amount: {
        type: Number,
        required: true
    },
    farmer_commission_rate: {
        type: Number,
        default: 4 // 4%
    },
    farmer_commission: {
        type: Number,
        required: true
    },
    trader_commission_rate: {
        type: Number,
        default: 9 // 9%
    },
    trader_commission: {
        type: Number,
        required: true
    },
    farmer_payable: {
        type: Number,
        required: true
    },
    trader_receivable: {
        type: Number,
        required: true
    },
    // Payment tracking
    farmer_payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    farmer_payment_mode: {
        type: String,
        enum: ['cash', 'cheque', 'upi', 'bank', ''],
        default: ''
    },
    farmer_payment_date: {
        type: Date
    },
    farmer_payment_reference: {
        type: String,
        default: ''
    },
    trader_payment_status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    trader_payment_mode: {
        type: String,
        enum: ['cash', 'cheque', 'upi', 'bank', ''],
        default: ''
    },
    trader_payment_date: {
        type: Date
    },
    trader_payment_reference: {
        type: String,
        default: ''
    },
    // Metadata
    market: {
        type: String,
        required: true
    },
    sold_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Pre-save hook to generate transaction_number
transactionSchema.pre('save', async function () {
    if (!this.isNew || this.transaction_number) {
        return;
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const count = await this.constructor.countDocuments({
        createdAt: { $gte: startOfYear, $lte: endOfYear }
    });

    const sequenceNumber = (count + 1).toString().padStart(6, '0');
    this.transaction_number = `TXN-${currentYear}-${sequenceNumber}`;
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
