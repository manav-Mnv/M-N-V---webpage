const { v4: uuidv4 } = require('uuid')
const { addToken } = require('./tokenStore')

function generateToken(ttlMinutes = 15) {
    const token = uuidv4()
    addToken(token, ttlMinutes)
    return token
}

module.exports = { generateToken }
