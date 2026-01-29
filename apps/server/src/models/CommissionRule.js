import mongoose from 'mongoose';

const commissionRuleSchema = new mongoose.Schema({
    role_type: {
        type: String,
        required: true,
        enum: ['farmer', 'trader']
    },
    crop_type: {
        type: String,
        default: 'All'
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 1 // Stores percentage as decimal (e.g. 0.04 for 4%)
    },
    effective_date: {
        type: Date,
        default: Date.now
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const CommissionRule = mongoose.model('CommissionRule', commissionRuleSchema);

export default CommissionRule;
