const nodemailer = require('nodemailer');

// Create reusable transporter object
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || '"JanSoochna" <noreply@jansoochna.in>',
      to,
      subject,
      html
    });
    if (!process.env.SMTP_HOST) {
      console.log(`[Email] Preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.error('[Email] Failed to send email:', err.message);
  }
}

async function sendAssignmentEmail({ to, reporterName, complaintTitle, complaintId, departmentName }) {
  await sendEmail({
    to,
    subject: `Your complaint is being handled — JanSoochna`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af;">Great news, ${reporterName}!</h2>
        <p>Your complaint <strong>"${complaintTitle}"</strong> has been assigned to the <strong>${departmentName}</strong> department.</p>
        <p style="color: #64748b;">An official will review and act on your report shortly.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/complaints/${complaintId}"
             style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View Your Complaint
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem;">Thank you for making your city better. — JanSoochna Team</p>
      </div>
    `
  });
}

async function sendResolutionEmail({ to, reporterName, complaintTitle, complaintId }) {
  await sendEmail({
    to,
    subject: `Your complaint has been resolved — JanSoochna`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #065f46;">Resolved: ${complaintTitle}</h2>
        <p>Hi ${reporterName}, we're happy to inform you that your complaint has been <strong>marked as resolved</strong>.</p>
        <p style="color: #64748b;">Your civic action made a difference. You've earned <strong>50 points</strong> on JanSoochna!</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/complaints/${complaintId}"
             style="background: #065f46; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View Resolution
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem;">Thank you for being an active citizen. — JanSoochna Team</p>
      </div>
    `
  });
}

async function sendStatusChangeEmail({ to, reporterName, complaintTitle, complaintId, newStatus }) {
  const statusLabels = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };
  await sendEmail({
    to,
    subject: `Status update on your complaint — JanSoochna`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af;">Status Update</h2>
        <p>Hi ${reporterName}, the status of your complaint <strong>"${complaintTitle}"</strong> has changed to <strong>${statusLabels[newStatus] || newStatus}</strong>.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/complaints/${complaintId}"
             style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View Complaint
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 0.85rem;">— JanSoochna Team</p>
      </div>
    `
  });
}

module.exports = { sendEmail, sendAssignmentEmail, sendResolutionEmail, sendStatusChangeEmail };
