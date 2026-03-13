const createCrudService = require("./createCrudService");
const incidentsModel = require("../models/incidentsModel");

const baseService = createCrudService({
  repository: incidentsModel,
  entityName: "Incident"
});

module.exports = {
  ...baseService,

  async create(data, req) {
    return baseService.create({
      ...data,
      created_by: req.user.sub
    });
  },

  async update(id, data, req) {
    const currentIncident = await baseService.getById(id);

    return baseService.update(id, {
      ...data,
      created_by:
        req.user.role === "admin" && data.created_by !== undefined ? data.created_by : currentIncident.created_by
    });
  }
};
