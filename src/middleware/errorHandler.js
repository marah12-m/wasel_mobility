const { sendError } = require("../views/errorView");

const notFoundHandler = (req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  sendError(res, err.message || "Internal server error", statusCode, err.details || null);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
