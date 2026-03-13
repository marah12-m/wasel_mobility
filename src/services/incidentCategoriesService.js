const createCrudService = require("./createCrudService");
const incidentCategoriesModel = require("../models/incidentCategoriesModel");

module.exports = createCrudService({
  repository: incidentCategoriesModel,
  entityName: "Incident category"
});
