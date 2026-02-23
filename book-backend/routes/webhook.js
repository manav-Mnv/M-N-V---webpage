const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { generateToken } = require('../utils/generateToken')
const { sendDownloadEmail } = require('../utils/sendEmail')

router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret) {
        const sig = req.headers['x-razorpay-signature']
        const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex')
        if (sig !== expected) {
            console.warn('[Webhook] Invalid signature — rejected')
            return res.status(400).json({ error: 'Invalid webhook signature' })
        }
    }

    let event
    try { event = JSON.parse(req.body.toString()) }
    catch (e) { return res.status(400).json({ error: 'Invalid JSON' }) }

    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity
        console.log('[Webhook] Captured:', payment.id, '| ₹', payment.amount / 100)

        const token = generateToken(60)
        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
        const downloadUrl = `${baseUrl}/download/${token}`

        if (payment.email) {
            sendDownloadEmail(payment.email, downloadUrl).catch(err =>
                console.error('[Webhook] Email failed:', err.message)
            )
        }
        console.log('[Webhook] Download URL:', downloadUrl)
    }

    res.json({ status: 'ok' })
})

module.exports = router
