const createCrudController = require("./createCrudController");
const incidentCategoriesService = require("../services/incidentCategoriesService");
const {
  showAllIncidentCategories,
  showIncidentCategory,
  showDeletedIncidentCategory
} = require("../views/incidentCategoriesView");

const controller = createCrudController({
  service: incidentCategoriesService,
  views: {
    showAll: showAllIncidentCategories,
    showOne: showIncidentCategory,
    showDeleted: showDeletedIncidentCategory
  }
});

module.exports = {
  getAllIncidentCategories: controller.getAll,
  getIncidentCategoryById: controller.getById,
  createIncidentCategory: controller.create,
  updateIncidentCategory: controller.update,
  deleteIncidentCategory: controller.remove
};
