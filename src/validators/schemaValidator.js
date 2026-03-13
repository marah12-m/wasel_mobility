const AppError = require("../errors/AppError");

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const validators = {
  string(value) {
    return typeof value === "string";
  },
  number(value) {
    return typeof value === "number" && Number.isFinite(value);
  },
  integer(value) {
    return Number.isInteger(value);
  },
  boolean(value) {
    return typeof value === "boolean";
  },
  email(value) {
    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
};

const validateRule = (field, value, rule, errors) => {
  if (value === null && rule.nullable) {
    return;
  }

  if (rule.type && !validators[rule.type]?.(value)) {
    errors[field] = `${field} is invalid`;
    return;
  }

  if (rule.minLength !== undefined && typeof value === "string" && value.length < rule.minLength) {
    errors[field] = `${field} must be at least ${rule.minLength} characters`;
    return;
  }

  if (rule.maxLength !== undefined && typeof value === "string" && value.length > rule.maxLength) {
    errors[field] = `${field} must be at most ${rule.maxLength} characters`;
    return;
  }

  if (rule.enum && !rule.enum.includes(value)) {
    errors[field] = `${field} is invalid`;
    return;
  }

  if (rule.custom && !rule.custom(value)) {
    errors[field] = `${field} is invalid`;
  }
};

const createSchemaValidator = (schema, { partial = false } = {}) => (body) => {
  if (!isPlainObject(body)) {
    throw new AppError("Request body must be a JSON object", 400);
  }

  const allowedFields = Object.keys(schema);
  const invalidFields = Object.keys(body).filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    throw new AppError("Validation failed", 400, { invalidFields });
  }

  if (!partial) {
    const missingFields = allowedFields.filter((field) => schema[field].required && (body[field] === undefined || body[field] === null || body[field] === ""));

    if (missingFields.length > 0) {
      throw new AppError("Validation failed", 400, { missingFields });
    }
  } else if (Object.keys(body).length === 0) {
    throw new AppError("Validation failed", 400, { body: "At least one field is required" });
  }

  const errors = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = body[field];

    if (value === undefined) {
      continue;
    }

    validateRule(field, value, rule, errors);
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }
};

module.exports = {
  createSchemaValidator
};
