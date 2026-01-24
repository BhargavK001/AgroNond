import mongoose from 'mongoose';

const dailyRateSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    vegetable: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'kg'
    },
    set_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique vegetable per date
dailyRateSchema.index({ date: 1, vegetable: 1 }, { unique: true });

const DailyRate = mongoose.model('DailyRate', dailyRateSchema);

export default DailyRate;
