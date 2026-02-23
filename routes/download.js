const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { validateToken, consumeToken } = require('../utils/tokenStore');

/**
 * GET /download/:token
 * Secure, one-time PDF download endpoint.
 * 
 * Place your PDF file at: book-backend/assets/who-stayed.pdf
 */
const PDF_PATH = path.join(__dirname, '../assets/who-stayed.pdf');

router.get('/:token', (req, res) => {
    const { token } = req.params;

    // Validate the token
    const result = validateToken(token);
    if (!result.valid) {
        if (result.reason === 'Token expired') {
            return res.status(410).send(`
        <html>
          <head><title>Link Expired</title></head>
          <body style="background:#0a0a0a;color:#f0f0f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;">
            <h1 style="color:#e74c3c;">⏰ Link Expired</h1>
            <p>This download link has expired. Please contact us to get a new one.</p>
            <a href="/" style="color:#4f6ef7;">Go back home</a>
          </body>
        </html>
      `);
        }
        return res.status(403).send(`
      <html>
        <head><title>Invalid Link</title></head>
        <body style="background:#0a0a0a;color:#f0f0f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;">
          <h1 style="color:#e74c3c;">❌ Invalid Link</h1>
          <p>${result.reason}. This link cannot be used.</p>
          <a href="/" style="color:#4f6ef7;">Go back home</a>
        </body>
      </html>
    `);
    }

    // Check if PDF exists on the server
    if (!fs.existsSync(PDF_PATH)) {
        console.error('[Download] PDF not found at:', PDF_PATH);
        return res.status(404).json({ error: 'File not found. Contact support.' });
    }

    // Consume the token (one-time use)
    consumeToken(token);

    console.log('[Download] Serving PDF for token:', token);

    // Stream the file to the user
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Who-Stayed-by-Mnv.pdf"');
    fs.createReadStream(PDF_PATH).pipe(res);
});

module.exports = router;
