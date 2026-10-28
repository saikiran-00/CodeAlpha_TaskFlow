/**
 * Global error-handling middleware.
 * Returns JSON with the error message and stack trace (development only).
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code was set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
