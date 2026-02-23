const nodemailer = require('nodemailer');

/**
 * Send download link to buyer's email.
 * Only runs if EMAIL_USER + EMAIL_PASS are set in .env
 */
async function sendDownloadEmail(toEmail, downloadUrl) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('[Email] Skipped — no email credentials in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Mnv Books" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Download Link — Who Stayed by Mnv',
        html: `
      <div style="font-family: 'Montserrat', sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #f0f0f0; border-radius: 12px;">
        <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #ffffff;">Thank you for your purchase 🎉</h1>
        <p style="margin-bottom: 1.5rem; line-height: 1.7; color: #cccccc;">
          Your copy of <strong>Who Stayed</strong> by Mnv is ready to download. 
          This link expires in <strong>15 minutes</strong>, so download it now.
        </p>
        <a href="${downloadUrl}" 
           style="display: inline-block; background: #4f6ef7; color: #fff; text-decoration: none; 
                  padding: 0.9rem 1.8rem; border-radius: 8px; font-weight: 700; font-size: 1rem;">
          Download Your eBook →
        </a>
        <p style="margin-top: 2rem; font-size: 0.8rem; color: #777;">
          If the link expires, please contact us. — Mnv
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Download link sent to ${toEmail}`);
}

module.exports = { sendDownloadEmail };
