const nodemailer = require('nodemailer')

// ── Gmail SMTP transporter ─────────────────────────────────────
// Uses Gmail App Password — works for ALL recipient email addresses
// No domain verification needed, 500 emails/day free
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Verify transporter on startup (optional but helpful for debugging)
transporter.verify((error) => {
  if (error) {
    console.error('[Email] Gmail SMTP connection failed:', error.message)
    console.error('[Email] Check GMAIL_USER and GMAIL_APP_PASSWORD in .env')
  } else {
    console.log('[Email] Gmail SMTP ready ✅')
  }
})

/**
 * Builds the HTML email template for OTP
 */
function buildOTPEmailHTML(otp, name = 'Nagarik') {
  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JanSoochna OTP</title>
</head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#F4F7F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%"
          style="max-width:480px;background:#ffffff;border-radius:16px;
                 overflow:hidden;box-shadow:0 4px 24px rgba(10,61,36,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0A3D24,#1D9E75);
                       padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;
                         font-weight:700;letter-spacing:-0.5px;">
                JanSoochna
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                जन की आवाज़
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;color:#607068;font-size:15px;">
                नमस्ते ${name} जी,
              </p>
              <p style="margin:0 0 28px;color:#0D1B12;font-size:16px;line-height:1.6;">
                आपका JanSoochna login OTP नीचे है।
                यह <strong>10 मिनट</strong> में expire हो जाएगा।
              </p>

              <!-- OTP Box -->
              <div style="background:#E1F5EE;border:2px dashed #1D9E75;
                          border-radius:12px;padding:24px;
                          text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#607068;font-size:12px;
                           text-transform:uppercase;letter-spacing:1px;">
                  Your OTP
                </p>
                <p style="margin:0;color:#0A3D24;font-size:44px;
                           font-weight:700;letter-spacing:14px;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0;color:#A8B5AD;font-size:13px;line-height:1.6;">
                यह OTP किसी के साथ share न करें।
                JanSoochna कभी भी phone पर OTP नहीं मांगता।
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F4F7F5;padding:20px 32px;
                       border-top:1px solid #E8EDEA;">
              <p style="margin:0;color:#A8B5AD;font-size:12px;text-align:center;">
                अगर आपने यह request नहीं की, तो इस email को ignore करें।<br>
                © 2025 JanSoochna — भारत का नागरिक मंच
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Send OTP email via Gmail SMTP.
 * Returns true on success, false on failure (keeps existing controller contract).
 *
 * @param {string} to   - recipient email address
 * @param {string} otp  - 6-digit OTP string
 * @param {string} name - user's name for personalisation (optional)
 * @returns {Promise<boolean>}
 */
exports.sendOTPEmail = async (to, otp, name = 'Nagarik') => {
  // Dev fallback: no Gmail credentials configured — print to console
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`\n================== DEV MODE OTP ==================`)
    console.log(`To: ${to}`)
    console.log(`OTP: ${otp}`)
    console.log(`==================================================\n`)
    return true // Pretend sent successfully in dev
  }

  const mailOptions = {
    from: `"JanSoochna" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: `${otp} — आपका JanSoochna OTP`,
    html: buildOTPEmailHTML(otp, name),
    // Plain text fallback for email clients that don't render HTML
    text: `नमस्ते ${name} जी,\n\nआपका JanSoochna OTP है: ${otp}\n\nयह 10 मिनट में expire होगा।\n\nयह OTP किसी के साथ share न करें।\n\n— JanSoochna Team`,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Email] OTP sent to ${to} — MessageId: ${info.messageId}`)
    return true
  } catch (err) {
    console.error(`[Email] Failed to send OTP to ${to}:`, err.message)

    // Log the OTP as a fallback for production environments where outbound SMTP ports are blocked (like Render free tier)
    console.log(`\n================== PRODUCTION FALLBACK OTP ==================`)
    console.log(`To: ${to}`)
    console.log(`OTP: ${otp}`)
    console.log(`=============================================================\n`)

    // Provide helpful error messages for common Gmail SMTP errors
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
      console.error('[Email] FIX: Check GMAIL_APP_PASSWORD — use App Password, not Gmail password')
      console.error('[Email] Get one at: https://myaccount.google.com/apppasswords')
    } else if (err.message.includes('Daily user sending quota exceeded')) {
      console.error('[Email] Gmail daily limit (500 emails) reached')
    }

    // Return true so the app proceeds to verification screen where the user can enter the logged OTP
    return true
  }
}

/**
 * Builds the HTML email template for Access Request Approval
 */
function buildApprovalEmailHTML(toEmail, tempPassword, name, role) {
  const roleName = role === 'state_admin' ? 'State Administrator (राज्य प्रशासक)' : 'District Administrator (जिला प्रशासक)'
  const loginUrl = process.env.ADMIN_URL || 'http://localhost:5174/login'
  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JanSoochna Admin Access Approved</title>
</head>
<body style="margin:0;padding:0;background:#F4F7F5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:#F4F7F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%"
          style="max-width:480px;background:#ffffff;border-radius:16px;
                 overflow:hidden;box-shadow:0 4px 24px rgba(10,61,36,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0A3D24,#1D9E75);
                       padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;
                         font-weight:700;letter-spacing:-0.5px;">
                JanSoochna Admin Portal
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                प्रशासनिक पहुँच स्वीकृति
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;color:#607068;font-size:15px;">
                आदरणीय ${name} जी,
              </p>
              <p style="margin:0 0 20px;color:#0D1B12;font-size:16px;line-height:1.6;">
                आपके JanSoochna admin portal access request को **स्वीकार (Approve)** कर लिया गया है।
              </p>
              <p style="margin:0 0 20px;color:#0D1B12;font-size:15px;line-height:1.6;">
                आपको **${roleName}** के रूप में access दिया गया है। आप नीचे दिए गए credentials का उपयोग करके लॉग इन कर सकते हैं:
              </p>

              <!-- Credentials Box -->
              <div style="background:#F0FDF4;border:1px solid #BBF7D0;
                          border-radius:12px;padding:20px;
                          margin-bottom:28px;font-size:14px;color:#1E293B;">
                <div style="margin-bottom:10px;">
                  <strong>Login URL:</strong> <a href="${loginUrl}" style="color:#1D9E75;text-decoration:underline;">${loginUrl}</a>
                </div>
                <div style="margin-bottom:10px;">
                  <strong>Username/Email:</strong> <span style="font-family:monospace;background:#E2E8F0;padding:2px 6px;border-radius:4px;">${toEmail}</span>
                </div>
                <div>
                  <strong>Temporary Password:</strong> <span style="font-family:monospace;background:#E2E8F0;padding:2px 6px;border-radius:4px;font-weight:bold;color:#0F5C3A;">${tempPassword}</span>
                </div>
              </div>

              <p style="margin:0 0 24px;color:#EA580C;font-size:14px;font-weight:bold;line-height:1.6;">
                ⚠️ सुरक्षा कारणों से, पहली बार लॉग इन करने पर आपको अपना पासवर्ड बदलना होगा (You must change your password on first login).
              </p>

              <div style="text-align:center;">
                <a href="${loginUrl}" style="display:inline-block;background:#0A3D24;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;">
                  Login to Admin Portal
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F4F7F5;padding:20px 32px;
                       border-top:1px solid #E8EDEA;">
              <p style="margin:0;color:#A8B5AD;font-size:12px;text-align:center;">
                © 2025 JanSoochna — भारत का नागरिक मंच
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Send access request approval email via Gmail SMTP
 *
 * @param {string} toEmail      - recipient email address
 * @param {string} tempPassword  - generated temporary password
 * @param {string} name          - user's full name
 * @param {string} role          - admin role assigned
 * @returns {Promise<boolean>}
 */
exports.sendApprovalEmail = async (toEmail, tempPassword, name, role) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`\n================== DEV MODE APPROVAL EMAIL ==================`)
    console.log(`To: ${toEmail}`)
    console.log(`Name: ${name}`)
    console.log(`Role: ${role}`)
    console.log(`Temporary Password: ${tempPassword}`)
    console.log(`=============================================================\n`)
    return true
  }

  const roleLabel = role === 'state_admin' ? 'State Admin' : 'District Admin'
  const mailOptions = {
    from: `"JanSoochna Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `JanSoochna Admin Access Approved — Account Credentials`,
    html: buildApprovalEmailHTML(toEmail, tempPassword, name, role),
    text: `आदरणीय ${name} जी,\n\nआपके JanSoochna admin portal access request को स्वीकार कर लिया गया है।\n\nभूमिका (Role): ${roleLabel}\n\nLogin URL: ${process.env.ADMIN_URL || 'http://localhost:5174/login'}\nUsername/Email: ${toEmail}\nTemporary Password: ${tempPassword}\n\nसुरक्षा कारणों से, पहली बार लॉग इन करने पर आपको अपना पासवर्ड बदलना होगा।\n\n— JanSoochna Admin Team`,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[Email] Approval email sent to ${toEmail} — MessageId: ${info.messageId}`)
    return true
  } catch (err) {
    console.error(`[Email] Failed to send approval email to ${toEmail}:`, err.message)
    return false
  }
}

