const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { validateToken, consumeToken } = require('../utils/tokenStore')

// Place your PDF at: book-backend/assets/who-stayed.pdf
const PDF_PATH = path.join(__dirname, '../assets/who-stayed.pdf')

router.get('/:token', (req, res) => {
    const { token } = req.params
    const result = validateToken(token)

    if (!result.valid) {
        const expired = result.reason === 'Token expired'
        return res.status(expired ? 410 : 403).send(`
      <html>
        <body style="background:#0a0a0a;color:#f0f0f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:1rem;">
          <h1 style="color:#e74c3c;">${expired ? '⏰ Link Expired' : '❌ Invalid Link'}</h1>
          <p>${result.reason}. Please contact us.</p>
          <a href="/books.html" style="color:#4f6ef7;">← Back to Books</a>
        </body>
      </html>`)
    }

    if (!fs.existsSync(PDF_PATH)) {
        console.error('[Download] PDF not found at:', PDF_PATH)
        return res.status(404).json({ error: 'File not found. Contact support.' })
    }

    consumeToken(token)
    console.log('[Download] Serving PDF for token:', token)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="Who-Stayed-by-Mnv.pdf"')
    fs.createReadStream(PDF_PATH).pipe(res)
})

module.exports = router
