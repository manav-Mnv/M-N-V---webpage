const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const { generateToken } = require('../utils/generateToken')
const { sendDownloadEmail } = require('../utils/sendEmail')

router.post('/', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment fields' })
    }

    // Verify HMAC-SHA256 signature
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

    if (expected !== razorpay_signature) {
        console.warn('[VerifyPayment] INVALID signature for order:', razorpay_order_id)
        return res.status(400).json({ error: 'Invalid payment signature' })
    }

    console.log('[VerifyPayment] Payment verified:', razorpay_order_id)

    const token = generateToken(15)
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
    const downloadUrl = `${baseUrl}/download/${token}`

    if (email) {
        sendDownloadEmail(email, downloadUrl).catch(err =>
            console.error('[VerifyPayment] Email failed:', err.message)
        )
    }

    res.json({ success: true, message: 'Payment verified!', downloadUrl, token })
})

module.exports = router
