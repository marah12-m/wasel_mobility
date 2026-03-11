const incidentsModel = require("../models/incidentsModel");
const {
  showAllIncidents,
  showIncident,
  showDeletedIncident
} = require("../views/incidentsView");

const getAllIncidents = async (req, res, next) => {
  try {
    const incidents = await incidentsModel.getAll();
    showAllIncidents(res, incidents);
  } catch (error) {
    next(error);
  }
};

const getIncidentById = async (req, res, next) => {
  try {
    const incident = await incidentsModel.getById(req.params.id);

    if (!incident) {
      const error = new Error("Incident not found");
      error.statusCode = 404;
      throw error;
    }

    showIncident(res, incident);
  } catch (error) {
    next(error);
  }
};

const createIncident = async (req, res, next) => {
  try {
    const incident = await incidentsModel.create(req.body);
    showIncident(res, incident, 201);
  } catch (error) {
    next(error);
  }
};

const updateIncident = async (req, res, next) => {
  try {
    const existingIncident = await incidentsModel.getById(req.params.id);

    if (!existingIncident) {
      const error = new Error("Incident not found");
      error.statusCode = 404;
      throw error;
    }

    const incident = await incidentsModel.update(req.params.id, req.body);
    showIncident(res, incident);
  } catch (error) {
    next(error);
  }
};

const deleteIncident = async (req, res, next) => {
  try {
    const deleted = await incidentsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Incident not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedIncident(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident
};
