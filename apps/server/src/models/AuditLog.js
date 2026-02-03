import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    // Who made the change
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_role: {
        type: String,
        required: true
    },

    // What action was performed
    action: {
        type: String,
        enum: ['create', 'update', 'delete'],
        required: true
    },

    // What entity was affected
    entity_type: {
        type: String,
        enum: ['payment', 'farmer', 'trader', 'weight', 'lilav', 'record', 'user', 'commission', 'daily_rate'],
        required: true
    },
    entity_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    // Human-readable description
    description: {
        type: String,
        required: true
    },

    // Detailed changes (before/after values)
    changes: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Additional context
    ip_address: {
        type: String
    },

    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // We use our own timestamp field
});

// Index for efficient queries
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user_id: 1, timestamp: -1 });
auditLogSchema.index({ entity_type: 1, timestamp: -1 });
auditLogSchema.index({ entity_id: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
