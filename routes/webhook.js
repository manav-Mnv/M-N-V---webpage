const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { generateToken } = require('../utils/generateToken');
const { sendDownloadEmail } = require('../utils/sendEmail');

/**
 * POST /webhook
 * Razorpay sends this when payment.captured fires.
 * This is a server-to-server backup — in case the user closes the browser
 * before /verify-payment is called from the frontend.
 */
router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // If no webhook secret is set, skip signature check (dev mode)
    if (webhookSecret) {
        const signature = req.headers['x-razorpay-signature'];
        const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(req.body)
            .digest('hex');

        if (signature !== expectedSig) {
            console.warn('[Webhook] Invalid signature — rejected');
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }
    }

    let event;
    try {
        event = JSON.parse(req.body.toString());
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }

    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        console.log('[Webhook] Payment captured:', payment.id, '| Amount:', payment.amount / 100, 'INR');

        // Generate a download token — this can be stored in DB and emailed
        const token = generateToken(60); // 60 min TTL for webhook path
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const downloadUrl = `${baseUrl}/download/${token}`;

        // Send email if customer's email is available
        const email = payment.email;
        if (email) {
            sendDownloadEmail(email, downloadUrl).catch(err =>
                console.error('[Webhook] Email send failed:', err.message)
            );
        }

        console.log('[Webhook] Download URL generated:', downloadUrl);
    }

    res.json({ status: 'ok' });
});

module.exports = router;
