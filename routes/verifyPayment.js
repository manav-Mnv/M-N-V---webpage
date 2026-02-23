const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { generateToken } = require('../utils/generateToken');
const { sendDownloadEmail } = require('../utils/sendEmail');

// POST /verify-payment
router.post('/', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment fields' });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        console.warn('[VerifyPayment] INVALID signature for order:', razorpay_order_id);
        return res.status(400).json({ error: 'Invalid payment signature. Payment not verified.' });
    }

    console.log('[VerifyPayment] Payment verified for order:', razorpay_order_id);

    // Generate secure, expiring download token (15 min TTL)
    const token = generateToken(15);

    // Build the download URL (backend serves the PDF)
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const downloadUrl = `${baseUrl}/download/${token}`;

    // Optionally send email
    if (email) {
        await sendDownloadEmail(email, downloadUrl).catch(err =>
            console.error('[VerifyPayment] Email send failed:', err.message)
        );
    }

    return res.json({
        success: true,
        message: 'Payment verified!',
        downloadUrl,
        token,
    });
});

module.exports = router;
