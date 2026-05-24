const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendOTPEmail = async (to, otp) => {
  // If no Resend API key and no SMTP credentials, fallback to console log for development
  if (!process.env.RESEND_API_KEY && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    console.log(`\n================== DEV MODE OTP ==================`);
    console.log(`To: ${to}`);
    console.log(`OTP: ${otp}`);
    console.log(`==================================================\n`);
    return true; // Pretend it was sent successfully
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0F5C3A; text-align: center;">JanSoochna</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Your One Time Password (OTP) for logging into JanSoochna is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1D9E75; background-color: #f4f7f5; padding: 10px 20px; border-radius: 8px;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">This OTP is valid for 10 minutes.</p>
      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 40px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'JanSoochna <onboarding@resend.dev>', // Default Resend sandbox domain
        to: [to],
        subject: 'Your JanSoochna Login OTP',
        html: htmlContent,
      });

      if (error) {
        console.error('Error sending email with Resend:', error);
        // We will fall through to Nodemailer below
      } else {
        console.log('Email sent with Resend:', data);
        return true;
      }
    } catch (error) {
      console.error('Exception with Resend:', error);
      // We will fall through to Nodemailer below
    }
  }

  // Fallback to Nodemailer
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const mailOptions = {
        from: `"JanSoochna" <${process.env.SMTP_USER}>`,
        to: to,
        subject: 'Your JanSoochna Login OTP',
        html: htmlContent,
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent via Nodemailer: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email with Nodemailer:', error);
      return false;
    }
  }

  return false;
};
