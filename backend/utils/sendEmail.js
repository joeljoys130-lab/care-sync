const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transport.
 * Uses Gmail SMTP. For production, replace with SendGrid or SES.
 */
const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email with HTML content.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransport();

  const mailOptions = {
    from: `"CareSync Health" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}: ${info.messageId}`);
  return info;
};

// ─── Email Templates ──────────────────────────────────────────────────────────

const otpEmailTemplate = (name, otp, purpose) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .body { padding: 32px; }
    .otp-box { background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp { font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #0284c7; }
    .footer { background: #f4f7fb; padding: 16px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💙 CareSync Health</h1></div>
    <div class="body">
      <h2>Hello, ${name}!</h2>
      <p>${purpose === 'verification' ? 'Thank you for registering. Please verify your email address using the OTP below.' : 'We received a request to reset your password. Use the OTP below.'}</p>
      <div class="otp-box">
        <p style="margin:0;color:#64748b;font-size:14px;">Your One-Time Password</p>
        <div class="otp">${otp}</div>
        <p style="margin:0;color:#64748b;font-size:12px;">Valid for 10 minutes</p>
      </div>
      <p>If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">© 2024 CareSync Health. All rights reserved.</div>
  </div>
</body>
</html>
`;

const appointmentConfirmTemplate = (name, doctorName, date, slot) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7fb; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .body { padding: 32px; }
    .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .footer { background: #f4f7fb; padding: 16px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✅ Appointment Confirmed</h1></div>
    <div class="body">
      <h2>Hi ${name},</h2>
      <p>Your appointment has been confirmed. Here are the details:</p>
      <div class="detail"><span><strong>Doctor:</strong></span><span>Dr. ${doctorName}</span></div>
      <div class="detail"><span><strong>Date:</strong></span><span>${date}</span></div>
      <div class="detail"><span><strong>Time:</strong></span><span>${slot.startTime} - ${slot.endTime}</span></div>
      <p style="margin-top:24px;">Please arrive 10 minutes early. We look forward to seeing you!</p>
    </div>
    <div class="footer">© 2024 CareSync Health</div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, otpEmailTemplate, appointmentConfirmTemplate };
