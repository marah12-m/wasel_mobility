const AppError = require("../errors/AppError");
const { verifyToken } = require("../utils/jwt");

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const authenticate = (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError("Authentication is required", 401);
    }

    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication is required", 401);
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize
};
