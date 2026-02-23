const express = require('express')
const router = express.Router()
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const BOOK_PRICE_PAISE = 1701 // ₹17.01

router.post('/', async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: BOOK_PRICE_PAISE,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: { product: 'Who Stayed - eBook', author: 'Mnv' },
        })
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        })
    } catch (err) {
        console.error('[CreateOrder] Error:', err)
        res.status(500).json({ error: 'Failed to create order', details: err.message })
    }
})

module.exports = router
