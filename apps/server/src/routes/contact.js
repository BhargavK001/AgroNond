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

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide name, email, subject, and message.',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address.',
      });
    }

    // Send email to admin
    await sendContactEmailToAdmin({ name, email, phone, subject, message });
    console.log(`✉️ Contact form email sent to admin from: ${email}`);

    // Send auto-reply to sender
    try {
      await sendAutoReply({ email, name });
      console.log(`✉️ Auto-reply sent to: ${email}`);
    } catch (autoReplyError) {
      // Log but don't fail the request if auto-reply fails
      console.error('Auto-reply failed:', autoReplyError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you shortly.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    
    // Check for specific Brevo errors
    if (error.response?.body) {
      console.error('Brevo API Error:', error.response.body);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: 'Something went wrong. Please try again later or contact us directly.',
    });
  }
});

export default router;
