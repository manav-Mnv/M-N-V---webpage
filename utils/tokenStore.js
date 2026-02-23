/**
 * In-memory token store.
 * Maps token → { expiry: Date, used: boolean }
 * For production: replace with Redis or a DB.
 */
const store = new Map();

function addToken(token, ttlMinutes = 15) {
    const expiry = new Date(Date.now() + ttlMinutes * 60 * 1000);
    store.set(token, { expiry, used: false });
}

function validateToken(token) {
    if (!store.has(token)) return { valid: false, reason: 'Token not found' };
    const entry = store.get(token);
    if (entry.used) return { valid: false, reason: 'Token already used' };
    if (new Date() > entry.expiry) {
        store.delete(token);
        return { valid: false, reason: 'Token expired' };
    }
    return { valid: true };
}

function consumeToken(token) {
    if (store.has(token)) {
        store.get(token).used = true;
    }
}

module.exports = { addToken, validateToken, consumeToken };
