const alertsModel = require("../models/alertsModel");
const { showAllAlerts, showAlert, showDeletedAlert } = require("../views/alertsView");

const getAllAlerts = async (req, res, next) => {
  try {
    const alerts = await alertsModel.getAll();
    showAllAlerts(res, alerts);
  } catch (error) {
    next(error);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const alert = await alertsModel.getById(req.params.id);

    if (!alert) {
      const error = new Error("Alert not found");
      error.statusCode = 404;
      throw error;
    }

    showAlert(res, alert);
  } catch (error) {
    next(error);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const alert = await alertsModel.create(req.body);
    showAlert(res, alert, 201);
  } catch (error) {
    next(error);
  }
};

const updateAlert = async (req, res, next) => {
  try {
    const existingAlert = await alertsModel.getById(req.params.id);

    if (!existingAlert) {
      const error = new Error("Alert not found");
      error.statusCode = 404;
      throw error;
    }

    const alert = await alertsModel.update(req.params.id, req.body);
    showAlert(res, alert);
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const deleted = await alertsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Alert not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedAlert(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert
};
