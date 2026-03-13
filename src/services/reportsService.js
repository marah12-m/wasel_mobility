const createCrudService = require("./createCrudService");
const reportsModel = require("../models/reportsModel");

const baseService = createCrudService({
  repository: reportsModel,
  entityName: "Report"
});

module.exports = {
  ...baseService,

  async create(data, req) {
    return baseService.create({
      ...data,
      user_id: req.user.sub
    });
  },

  async update(id, data, req) {
    const currentReport = await baseService.getById(id);

    return baseService.update(id, {
      ...data,
      user_id: req.user.role === "admin" && data.user_id !== undefined ? data.user_id : currentReport.user_id
    });
  }
};
