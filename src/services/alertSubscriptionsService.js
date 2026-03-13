const AppError = require("../errors/AppError");
const createCrudService = require("./createCrudService");
const alertSubscriptionsModel = require("../models/alertSubscriptionsModel");

const baseService = createCrudService({
  repository: alertSubscriptionsModel,
  entityName: "Alert subscription"
});

module.exports = {
  ...baseService,

  async getAll(req) {
    if (req.user.role === "admin" || req.user.role === "moderator") {
      return baseService.getAll();
    }

    const subscriptions = await baseService.getAll();
    return subscriptions.filter((subscription) => subscription.user_id === req.user.sub);
  },

  async getById(id, req) {
    const subscription = await baseService.getById(id);

    if (req.user.role === "admin" || req.user.role === "moderator" || subscription.user_id === req.user.sub) {
      return subscription;
    }

    throw new AppError("Alert subscription not found", 404);
  },

  async create(data, req) {
    return baseService.create({
      ...data,
      user_id: req.user.sub
    });
  },

  async update(id, data, req) {
    await this.getById(id, req);
    return baseService.update(id, {
      ...data,
      user_id: req.user.sub
    });
  },

  async remove(id, req) {
    await this.getById(id, req);
    return baseService.remove(id);
  }
};
