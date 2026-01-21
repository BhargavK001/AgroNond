import express from 'express';
import { sendContactEmailToAdmin, sendAutoReply } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/contact
 * Handle contact form submissions
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'subject', 'message'] 
      });
    }

    // 1. Send email to Admin
    await sendContactEmailToAdmin({ name, email, phone, subject, message });

    // 2. Send auto-reply to User (fire and forget to speed up response)
    sendAutoReply({ email, name }).catch(err => 
      console.error('Failed to send auto-reply:', err)
    );

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
