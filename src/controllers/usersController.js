const createCrudController = require("./createCrudController");
const usersService = require("../services/usersService");
const { showAllUsers, showUser, showDeletedUser } = require("../views/usersView");

const controller = createCrudController({
  service: usersService,
  views: {
    showAll: showAllUsers,
    showOne: showUser,
    showDeleted: showDeletedUser
  }
});

module.exports = {
  getAllUsers: controller.getAll,
  getUserById: controller.getById,
  createUser: controller.create,
  updateUser: controller.update,
  deleteUser: controller.remove
};
