const crypto = require("crypto");
const AppError = require("../errors/AppError");

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
};

const parseExpiresIn = (value) => {
  if (!value) {
    return 60 * 60 * 24;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = String(value).match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw new AppError("Invalid JWT expiration configuration", 500);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24
  };

  return amount * multipliers[unit];
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT secret is not configured", 500);
  }

  return secret;
};

const signToken = (payload, options = {}) => {
  const secret = getJwtSecret();
  const expiresInSeconds = parseExpiresIn(options.expiresIn || process.env.JWT_EXPIRES_IN);
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const content = `${encodedHeader}.${encodedBody}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(content)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${content}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new AppError("Authentication token is required", 401);
  }

  const secret = getJwtSecret();
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new AppError("Invalid authentication token", 401);
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new AppError("Invalid authentication token", 401);
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader));

  if (header.alg !== "HS256" || header.typ !== "JWT") {
    throw new AppError("Invalid authentication token", 401);
  }

  const payload = JSON.parse(base64UrlDecode(encodedBody));
  const now = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp <= now) {
    throw new AppError("Authentication token expired", 401);
  }

  return payload;
};

module.exports = {
  signToken,
  verifyToken
};
