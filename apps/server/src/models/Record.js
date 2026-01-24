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
    }
}, {
    timestamps: true
});

const Record = mongoose.model('Record', recordSchema);

export default Record;
