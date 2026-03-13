const createCrudController = require("./createCrudController");
const incidentsService = require("../services/incidentsService");
const { showAllIncidents, showIncident, showDeletedIncident } = require("../views/incidentsView");

const controller = createCrudController({
  service: incidentsService,
  views: {
    showAll: showAllIncidents,
    showOne: showIncident,
    showDeleted: showDeletedIncident
  }
});

module.exports = {
  getAllIncidents: controller.getAll,
  getIncidentById: controller.getById,
  createIncident: controller.create,
  updateIncident: controller.update,
  deleteIncident: controller.remove
};
