const alertSubscriptionsModel = require("../models/alertSubscriptionsModel");
const {
  showAllAlertSubscriptions,
  showAlertSubscription,
  showDeletedAlertSubscription
} = require("../views/alertSubscriptionsView");

const getAllAlertSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await alertSubscriptionsModel.getAll();
    showAllAlertSubscriptions(res, subscriptions);
  } catch (error) {
    next(error);
  }
};

const getAlertSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await alertSubscriptionsModel.getById(req.params.id);

    if (!subscription) {
      const error = new Error("Alert subscription not found");
      error.statusCode = 404;
      throw error;
    }

    showAlertSubscription(res, subscription);
  } catch (error) {
    next(error);
  }
};

const createAlertSubscription = async (req, res, next) => {
  try {
    const subscription = await alertSubscriptionsModel.create(req.body);
    showAlertSubscription(res, subscription, 201);
  } catch (error) {
    next(error);
  }
};

const updateAlertSubscription = async (req, res, next) => {
  try {
    const existingSubscription = await alertSubscriptionsModel.getById(req.params.id);

    if (!existingSubscription) {
      const error = new Error("Alert subscription not found");
      error.statusCode = 404;
      throw error;
    }

    const subscription = await alertSubscriptionsModel.update(req.params.id, req.body);
    showAlertSubscription(res, subscription);
  } catch (error) {
    next(error);
  }
};

const deleteAlertSubscription = async (req, res, next) => {
  try {
    const deleted = await alertSubscriptionsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Alert subscription not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedAlertSubscription(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlertSubscriptions,
  getAlertSubscriptionById,
  createAlertSubscription,
  updateAlertSubscription,
  deleteAlertSubscription
};
