const AppError = require("../errors/AppError");
const createCrudService = require("./createCrudService");
const usersModel = require("../models/usersModel");
const { hashPassword } = require("../utils/password");
const { sanitizeUser, sanitizeUsers } = require("../utils/userSerializer");

const baseService = createCrudService({
  repository: usersModel,
  entityName: "User"
});

const ensureEmailAvailable = async (email, excludedUserId = null) => {
  if (!email) {
    return;
  }

  const existingUser = await usersModel.getByEmail(email);

  if (existingUser && existingUser.id !== excludedUserId) {
    throw new AppError("Email is already in use", 409);
  }
};

module.exports = {
  async getAll() {
    const users = await baseService.getAll();
    return sanitizeUsers(users);
  },

  async getById(id) {
    const user = await baseService.getById(id);
    return sanitizeUser(user);
  },

  async create(data) {
    await ensureEmailAvailable(data.email);
    const user = await baseService.create({
      ...data,
      password: await hashPassword(data.password)
    });
    return sanitizeUser(user);
  },

  async update(id, data) {
    await ensureEmailAvailable(data.email, Number(id));
    const payload = {
      ...data
    };

    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }

    const currentUser = await usersModel.getById(id);
    const updatedUser = await usersModel.update(id, {
      name: payload.name !== undefined ? payload.name : currentUser.name,
      email: payload.email !== undefined ? payload.email : currentUser.email,
      password: payload.password !== undefined ? payload.password : currentUser.password,
      role: payload.role !== undefined ? payload.role : currentUser.role
    });

    return sanitizeUser(updatedUser);
  },

  remove: baseService.remove
};
