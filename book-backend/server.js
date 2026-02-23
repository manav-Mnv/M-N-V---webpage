require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }))

// Raw body needed for webhook signature verification (must be BEFORE express.json)
app.use('/webhook', require('./routes/webhook'))

// JSON parser for all other routes
app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/create-order', require('./routes/createOrder'))
app.use('/verify-payment', require('./routes/verifyPayment'))
app.use('/download', require('./routes/download'))

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Mnv Books Backend is running 🚀' })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`)
    console.log(`   Create Order : POST http://localhost:${PORT}/create-order`)
    console.log(`   Verify Pay   : POST http://localhost:${PORT}/verify-payment`)
    console.log(`   Webhook      : POST http://localhost:${PORT}/webhook`)
    console.log(`   Download     : GET  http://localhost:${PORT}/download/:token\n`)
})
