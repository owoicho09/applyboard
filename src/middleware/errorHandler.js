const errorHandler = (err, req, res, next) => {
  console.error('[ERROR HANDLER]', {
    message: err.message,
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path:    req.path,
    method:  req.method,
  });

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error:   err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };