import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {Object} params.user - The user making the change (from req.user)
 * @param {string} params.action - 'create', 'update', or 'delete'
 * @param {string} params.entityType - Type of entity being changed
 * @param {string} params.entityId - ID of the entity being changed
 * @param {string} params.description - Human-readable description
 * @param {Object} params.changes - Object containing before/after values
 * @param {string} params.ipAddress - Optional IP address
 */
export async function createAuditLog({
    user,
    action,
    entityType,
    entityId,
    description,
    changes = {},
    ipAddress = null
}) {
    try {
        if (!user || !user._id) {
            console.warn('Audit log skipped: No user provided');
            return null;
        }

        const auditLog = new AuditLog({
            user_id: user._id,
            user_name: user.full_name || user.phone || 'Unknown User',
            user_role: user.role || 'unknown',
            action,
            entity_type: entityType,
            entity_id: entityId,
            description,
            changes,
            ip_address: ipAddress
        });

        await auditLog.save();
        return auditLog;
    } catch (error) {
        // Log error but don't throw - audit logging should not break main operations
        console.error('Failed to create audit log:', error);
        return null;
    }
}

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 */
export function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null;
}

/**
 * Generate description for common actions
 */
export const AuditDescriptions = {
    paymentStatus: (type, status, entityName) =>
        `Marked ${type} payment as "${status}" for ${entityName}`,

    createWeight: (farmerName, vegetable, qty) =>
        `Created weight entry: ${qty} kg of ${vegetable} for ${farmerName}`,

    createLilav: (farmerName, vegetable, traderName, amount) =>
        `Recorded lilav/auction: ${vegetable} sold to ${traderName} for ₹${amount}`,

    updateUser: (userName, role) =>
        `Updated ${role} profile: ${userName}`,

    createUser: (userName, role) =>
        `Created new ${role}: ${userName}`,

    deleteUser: (userName, role) =>
        `Deleted ${role}: ${userName}`,

    updateRecord: (recordType, details) =>
        `Updated ${recordType}: ${details}`
};

export default createAuditLog;
