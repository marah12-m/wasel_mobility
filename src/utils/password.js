const crypto = require("crypto");

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

const scrypt = (value, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(value, salt, KEY_LENGTH, { N: 16384 }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = await scrypt(password, salt);
  return `${salt}:${hash.toString("hex")}`;
};

const verifyPassword = async (password, storedPassword) => {
  if (!storedPassword || !storedPassword.includes(":")) {
    return false;
  }

  const [salt, storedHash] = storedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const calculatedHash = await scrypt(password, salt);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== calculatedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, calculatedHash);
};

module.exports = {
  hashPassword,
  verifyPassword
};
