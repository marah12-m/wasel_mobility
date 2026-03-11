const usersModel = require("../models/usersModel");
const { showAllUsers, showUser, showDeletedUser } = require("../views/usersView");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await usersModel.getAll();
    showAllUsers(res, users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await usersModel.getById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    showUser(res, user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await usersModel.create(req.body);
    showUser(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const existingUser = await usersModel.getById(req.params.id);

    if (!existingUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = await usersModel.update(req.params.id, req.body);
    showUser(res, user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await usersModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedUser(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
