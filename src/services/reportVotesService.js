const createCrudService = require("./createCrudService");
const reportVotesModel = require("../models/reportVotesModel");

const baseService = createCrudService({
  repository: reportVotesModel,
  entityName: "Report vote"
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
    const currentVote = await baseService.getById(id);

    return baseService.update(id, {
      ...data,
      user_id: req.user.role === "admin" && data.user_id !== undefined ? data.user_id : currentVote.user_id
    });
  }
};
