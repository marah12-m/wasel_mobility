const crypto = require("crypto");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");

module.exports = {
  hashToken,
  generateRefreshToken
};
