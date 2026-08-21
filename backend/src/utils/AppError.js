// Operational errors (bad input, not found) vs programming errors (bugs) —
// isOperational lets the error handler decide whether to expose details to the client
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Keeps this constructor out of the stack trace for cleaner debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
