const createCrudService = require("./createCrudService");
const moderationLogsModel = require("../models/moderationLogsModel");

const baseService = createCrudService({
  repository: moderationLogsModel,
  entityName: "Moderation log"
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
    return baseService.update(id, {
      ...data,
      user_id: req.user.sub
    });
  }
};
