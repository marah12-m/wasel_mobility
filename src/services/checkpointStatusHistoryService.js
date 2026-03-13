const createCrudService = require("./createCrudService");
const checkpointStatusHistoryModel = require("../models/checkpointStatusHistoryModel");

const baseService = createCrudService({
  repository: checkpointStatusHistoryModel,
  entityName: "Checkpoint status history"
});

module.exports = {
  ...baseService,

  async create(data, req) {
    return baseService.create({
      ...data,
      updated_by: req.user.sub
    });
  },

  async update(id, data, req) {
    return baseService.update(id, {
      ...data,
      updated_by: req.user.sub
    });
  }
};
