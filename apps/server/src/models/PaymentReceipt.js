import mongoose from 'mongoose';

const paymentReceiptSchema = new mongoose.Schema({
    receipt_number: {
        type: String,
        unique: true,
        required: true
    },
    trader_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Which records (invoices) this payment covers
    records: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
    }],
    amount: {
        type: Number,
        required: true
    },
    mode: {
        type: String, // Cash, UPI, etc.
        required: true
    },
    reference: {
        type: String // Optional external transaction ID
    },
    date: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Auto-generate receipt number
paymentReceiptSchema.pre('save', async function () {
    if (!this.isNew || this.receipt_number) return;

    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

        const count = await this.constructor.countDocuments({
            createdAt: { $gte: startOfYear }
        });

        // Format: RCPT-2025-001
        this.receipt_number = `RCPT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
        throw error;
    }
});

const PaymentReceipt = mongoose.model('PaymentReceipt', paymentReceiptSchema);
export default PaymentReceipt;
