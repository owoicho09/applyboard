const jwt = require('jsonwebtoken');

// ── Basic auth for initial login ──────────────────────────
const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || '';
  const b64        = authHeader.split(' ')[1] || '';
  const decoded    = Buffer.from(b64, 'base64').toString('utf-8');
  const [user, pass] = decoded.split(':');

  if (
    user === process.env.ADMIN_USERNAME &&
    pass === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="ApplyBoard Admin"');
  return res.status(401).json({ error: 'Unauthorized' });
};

// ── JWT auth for dashboard API calls ─────────────────────
const generateToken = (username) => {
  return jwt.sign(
    { username, role: 'admin' },
    process.env.ADMIN_SECRET,
    { expiresIn: '12h' }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.headers['x-admin-token'] ||
                req.cookies?.adminToken ||
                req.query?.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    req.admin     = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { basicAuth, generateToken, verifyToken };