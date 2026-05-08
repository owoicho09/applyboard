const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const supabase = require('../config/database');

// ── Department to service mapping ────────────────────────
const DEPT_SERVICES = {
  admissions:   ['study_abroad', 'loan', 'pof'],
  visa:         ['visa'],
  support:      ['test_prep'],
  finance:      ['all'], // sees all payments
  info:         ['travel', 'insurance', 'pilgrimage', 'general'],
  partnerships: ['partnerships'],
  complaints:   ['escalated', 'complaints'],
  superadmin:   ['all'],
};

const getDeptFromEmail = (email) => {
  if (!email) return 'info';
  const prefix = email.split('@')[0].toLowerCase();
  const map = {
    admissions:   'admissions',
    support:      'support',
    info:         'info',
    finance:      'finance',
    visa:         'visa',
    partnerships: 'partnerships',
    complaints:   'complaints',
  };
  return map[prefix] || 'info';
};

// ── Team member login ─────────────────────────────────────
const loginUser = async (email, password) => {
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !user) throw new Error('Invalid email or password');

  let valid = false;
  if (user.password.startsWith('$2')) {
    valid = await bcrypt.compare(password, user.password);
  } else {
    valid = user.password === password;
  }

  if (!valid) throw new Error('Invalid email or password');

  await supabase
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  return user;
};

// ── Basic auth (super admin via env) ─────────────────────
const basicAuth = (req, res, next) => {
  const authHeader   = req.headers['authorization'] || '';
  const b64          = authHeader.split(' ')[1] || '';
  const decoded      = Buffer.from(b64, 'base64').toString('utf-8');
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

// ── Generate JWT ──────────────────────────────────────────
const generateToken = (username, role = 'agent', department = '') => {
  return jwt.sign(
    { username, role, department },
    process.env.ADMIN_SECRET,
    { expiresIn: '12h' }
  );
};

// ── Verify JWT middleware ─────────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.headers['x-admin-token']
             || req.cookies?.adminToken
             || req.query?.token;

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    req.admin     = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  basicAuth,
  loginUser,
  generateToken,
  verifyToken,
  getDeptFromEmail,
  DEPT_SERVICES,
};