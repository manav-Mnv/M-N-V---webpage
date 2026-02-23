const { v4: uuidv4 } = require('uuid');
const { addToken } = require('./tokenStore');

/**
 * Generate a secure one-time download token.
 * @param {number} ttlMinutes - How long until the link expires (default: 15 min)
 * @returns {string} - The token string
 */
function generateToken(ttlMinutes = 15) {
    const token = uuidv4();
    addToken(token, ttlMinutes);
    return token;
}

module.exports = { generateToken };
