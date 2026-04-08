const AppError = require("../errors/AppError");

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const ensureObjectBody = (body) => {
  if (!isPlainObject(body)) {
    throw new AppError("Request body must be a JSON object", 400);
  }
};

const validateIdParam = (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Invalid resource id", 400);
    }

    req.params.id = String(id);
    next();
  } catch (error) {
    next(error);
  }
};

const validateBody = (validator) => (req, res, next) => {
  try {
    ensureObjectBody(req.body);
    validator(req.body, req);
    next();
  } catch (error) {
    next(error);
  }
};

const validateQuery = (validator) => (req, res, next) => {
  try {
    validator(req.query, req);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateIdParam,
  validateBody,
  validateQuery
};
