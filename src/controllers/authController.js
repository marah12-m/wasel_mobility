const AppError = require("../errors/AppError");
const authService = require("../services/authService");
const { showAuthResult } = require("../views/authView");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    showAuthResult(res, result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    showAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    if (!req.body.refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await authService.refresh(req.body.refreshToken);
    showAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    if (!req.body.refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const result = await authService.logout(req.body.refreshToken);
    showAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const result = await authService.logoutAll(req.user.sub);
    showAuthResult(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll
};
