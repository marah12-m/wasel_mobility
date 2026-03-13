const createCrudController = require("./createCrudController");
const alertsService = require("../services/alertsService");
const { showAllAlerts, showAlert, showDeletedAlert } = require("../views/alertsView");

const controller = createCrudController({
  service: alertsService,
  views: {
    showAll: showAllAlerts,
    showOne: showAlert,
    showDeleted: showDeletedAlert
  }
});

module.exports = {
  getAllAlerts: controller.getAll,
  getAlertById: controller.getById,
  createAlert: controller.create,
  updateAlert: controller.update,
  deleteAlert: controller.remove
};
