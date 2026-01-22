// Direct HTTP implementation for Brevo API

/**
 * Get configuration from environment (read lazily to ensure dotenv has loaded)
 */
function getConfig() {
  return {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'support@khomrajthorat.com',
    SENDER_NAME: process.env.BREVO_SENDER_NAME || 'AgroNond',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'bhargavk056@gmail.com',
    WEBSITE_URL: process.env.WEBSITE_URL || 'https://agronond.bhargavkarande.dev',
  };
}

/**
 * Send email via Brevo API
 */
async function sendBrevoEmail(payload) {
  const { BREVO_API_KEY } = getConfig();
  
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured in .env file');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Brevo API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Send contact form submission to admin
 */
export async function sendContactEmailToAdmin({ name, email, phone, subject, message }) {
  const { SENDER_NAME, SENDER_EMAIL, ADMIN_EMAIL, WEBSITE_URL } = getConfig();
  
  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: ADMIN_EMAIL, name: 'AgroNond Admin' }],
    replyTo: { email, name },
    subject: `[Contact Form] ${subject}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; }
          .field { margin-bottom: 15px; }
          .label { font-weight: 600; color: #374151; font-size: 12px; text-transform: uppercase; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #22c55e; border-radius: 0 6px 6px 0; }
          .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            Sent from <a href="${WEBSITE_URL}">${WEBSITE_URL}</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return sendBrevoEmail(payload);
}

/**
 * Send auto-reply confirmation to the sender
 */
export async function sendAutoReply({ email, name }) {
  const { SENDER_NAME, SENDER_EMAIL, WEBSITE_URL } = getConfig();
  
  const payload = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email, name }],
    subject: 'Thank you for contacting AgroNond!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .cta { text-align: center; margin: 30px 0; }
          .cta a { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
          .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 AgroNond</h1>
            <p>Agricultural Market Management System</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for reaching out! We have received your message and will get back to you shortly.</p>
            <div class="cta">
              <a href="${WEBSITE_URL}">Visit AgroNond</a>
            </div>
          </div>
          <div class="footer">
            <p><strong>AgroNond</strong></p>
            <p><a href="${WEBSITE_URL}" style="color: #22c55e;">${WEBSITE_URL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return sendBrevoEmail(payload);
}
