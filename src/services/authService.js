const AppError = require("../errors/AppError");
const usersModel = require("../models/usersModel");
const refreshTokensModel = require("../models/refreshTokensModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const { sanitizeUser } = require("../utils/userSerializer");
const { generateRefreshToken, hashToken } = require("../utils/tokenHash");

const parseRefreshExpiresInDays = () => {
  const rawValue = process.env.JWT_REFRESH_EXPIRES_IN_DAYS;

  if (!rawValue) {
    return 30;
  }

  const days = Number(rawValue);

  if (!Number.isInteger(days) || days <= 0) {
    throw new AppError("Invalid refresh token expiration configuration", 500);
  }

  return days;
};

const createExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseRefreshExpiresInDays());
  return expiresAt;
};

const buildAccessToken = (user) =>
  signToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

const buildUserPayload = (user) =>
  sanitizeUser({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

const issueRefreshToken = async (userId) => {
  const refreshToken = generateRefreshToken();

  await refreshTokensModel.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: createExpiryDate()
  });

  return refreshToken;
};

const buildAuthPayload = async (user) => ({
  accessToken: buildAccessToken(user),
  refreshToken: await issueRefreshToken(user.id),
  user: buildUserPayload(user)
});

const register = async (data) => {
  const existingUser = await usersModel.getByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  const user = await usersModel.create({
    ...data,
    role: data.role || "citizen",
    password: await hashPassword(data.password)
  });

  return buildAuthPayload(user);
};

const login = async ({ email, password }) => {
  const user = await usersModel.getByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return buildAuthPayload(user);
};

const refresh = async (refreshToken) => {
  await refreshTokensModel.revokeExpired();

  const tokenHash = hashToken(refreshToken);
  const storedToken = await refreshTokensModel.getByTokenHash(tokenHash);

  if (!storedToken || new Date(storedToken.expires_at) <= new Date()) {
    throw new AppError("Invalid refresh token", 401);
  }

  await refreshTokensModel.revokeByTokenHash(tokenHash);

  const user = {
    id: storedToken.user_id,
    name: storedToken.name,
    email: storedToken.email,
    role: storedToken.role
  };

  return {
    accessToken: buildAccessToken(user),
    refreshToken: await issueRefreshToken(storedToken.user_id),
    user: buildUserPayload(user)
  };
};

const logout = async (refreshToken) => {
  const revoked = await refreshTokensModel.revokeByTokenHash(hashToken(refreshToken));

  if (!revoked) {
    throw new AppError("Invalid refresh token", 401);
  }

  return { loggedOut: true };
};

const logoutAll = async (userId) => {
  await refreshTokensModel.revokeByUserId(userId);
  return { loggedOut: true };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll
};
