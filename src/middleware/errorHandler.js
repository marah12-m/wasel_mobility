const { sendError } = require("../views/errorView");

const normalizeDatabaseError = (error) => {
  if (error.code === "ER_DUP_ENTRY") {
    error.statusCode = 409;
    error.message = "Duplicate resource";
    return error;
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_ROW_IS_REFERENCED_2") {
    error.statusCode = 400;
    error.message = "Invalid related resource";
    return error;
  }

  return error;
};

const notFoundHandler = (req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  const normalizedError = normalizeDatabaseError(err);
  const statusCode = normalizedError.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error" : normalizedError.message || "Request failed";
  const details = statusCode >= 500 ? null : normalizedError.details || null;
  sendError(res, message, statusCode, details);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
