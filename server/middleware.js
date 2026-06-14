const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'alumniconnect-internship-secret-change-in-production';

function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        req.user = jwt.verify(header.slice(7), JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function alumniOnly(req, res, next) {
    if (req.user.role !== 'alumni') {
        return res.status(403).json({ error: 'Alumni access only' });
    }
    next();
}

function studentOnly(req, res, next) {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Student access only' });
    }
    next();
}

module.exports = { authRequired, alumniOnly, studentOnly, JWT_SECRET };
