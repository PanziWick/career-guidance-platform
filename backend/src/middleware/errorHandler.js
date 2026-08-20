const AppError = require('../utils/AppError');

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleCastError = (err) => {
  return new AppError(`Invalid value for ${err.path}: ${err.value}`, 400);
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  return new AppError(`Duplicate value for field: ${field}`, 409);
};

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal server error',
  };

  if (process.env.NODE_ENV === 'development' && !error.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
