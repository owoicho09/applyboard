const morgan = require('morgan');

// Custom token: truncate long request bodies in logs
morgan.token('body', (req) => {
  if (!req.body) return '-';
  const str = JSON.stringify(req.body);
  return str.length > 200 ? str.slice(0, 200) + '...' : str;
});

// Dev format: colourful, concise
const devFormat = ':method :url :status :response-time ms';

// Production format: structured for log aggregators
const prodFormat = JSON.stringify({
  time:   ':date[iso]',
  method: ':method',
  url:    ':url',
  status: ':status',
  ms:     ':response-time',
  ip:     ':remote-addr',
});

const format = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Skip logging for health checks to reduce noise
const skip = (req) => req.url === '/health';

const logger = morgan(format, { skip });

module.exports = logger;