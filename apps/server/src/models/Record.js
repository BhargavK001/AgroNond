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
    }
}, {
    timestamps: true
});

const Record = mongoose.model('Record', recordSchema);

export default Record;