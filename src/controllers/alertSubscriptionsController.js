const createCrudController = require("./createCrudController");
const alertSubscriptionsService = require("../services/alertSubscriptionsService");
const {
  showAllAlertSubscriptions,
  showAlertSubscription,
  showDeletedAlertSubscription
} = require("../views/alertSubscriptionsView");

const controller = createCrudController({
  service: alertSubscriptionsService,
  views: {
    showAll: showAllAlertSubscriptions,
    showOne: showAlertSubscription,
    showDeleted: showDeletedAlertSubscription
  }
});

module.exports = {
  getAllAlertSubscriptions: controller.getAll,
  getAlertSubscriptionById: controller.getById,
  createAlertSubscription: controller.create,
  updateAlertSubscription: controller.update,
  deleteAlertSubscription: controller.remove
};
