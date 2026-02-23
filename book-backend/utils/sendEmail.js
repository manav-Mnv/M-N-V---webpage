const nodemailer = require('nodemailer')

async function sendDownloadEmail(toEmail, downloadUrl) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('[Email] Skipped — no email credentials in .env')
        return
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    await transporter.sendMail({
        from: `"Mnv Books" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Download Link — Who Stayed by Mnv',
        html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;background:#0a0a0a;color:#f0f0f0;border-radius:12px;">
        <h1 style="color:#fff;">Thank you for your purchase 🎉</h1>
        <p style="color:#ccc;line-height:1.7;">Your copy of <strong>Who Stayed</strong> is ready. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${downloadUrl}" style="display:inline-block;background:#4f6ef7;color:#fff;padding:0.9rem 1.8rem;border-radius:8px;font-weight:700;text-decoration:none;">
          Download Your eBook →
        </a>
        <p style="margin-top:2rem;font-size:0.8rem;color:#777;">Questions? Contact us. — Mnv</p>
      </div>`,
    })
    console.log(`[Email] Sent to ${toEmail}`)
}

module.exports = { sendDownloadEmail }
