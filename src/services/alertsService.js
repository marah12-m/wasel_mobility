const createCrudService = require("./createCrudService");
const alertsModel = require("../models/alertsModel");

module.exports = createCrudService({
  repository: alertsModel,
  entityName: "Alert"
});
