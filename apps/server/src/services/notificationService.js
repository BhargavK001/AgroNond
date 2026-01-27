import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, type = 'info', title, message, data = {} }) => {
    try {
        const notification = new Notification({
            recipient,
            type,
            title,
            message,
            data
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw error to avoid breaking the main flow (e.g. sale completion) just because notification failed
        return null;
    }
};
