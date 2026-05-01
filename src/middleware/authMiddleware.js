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

module.exports = { basicAuth };