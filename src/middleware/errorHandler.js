const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
  });
};

module.exports = errorHandler;