const createCrudService = require("./createCrudService");
const checkpointsModel = require("../models/checkpointsModel");

module.exports = createCrudService({
  repository: checkpointsModel,
  entityName: "Checkpoint"
});
