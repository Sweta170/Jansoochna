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

    // Provide helpful error messages for common Gmail SMTP errors
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
      console.error('[Email] FIX: Check GMAIL_APP_PASSWORD — use App Password, not Gmail password')
      console.error('[Email] Get one at: https://myaccount.google.com/apppasswords')
    } else if (err.message.includes('Daily user sending quota exceeded')) {
      console.error('[Email] Gmail daily limit (500 emails) reached')
    }

    return false
  }
}
