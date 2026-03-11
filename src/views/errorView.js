const sendError = (res, message, statusCode = 500, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details
    }
  });
};

module.exports = {
  sendError
};
