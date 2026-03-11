const incidentCategoriesModel = require("../models/incidentCategoriesModel");
const {
  showAllIncidentCategories,
  showIncidentCategory,
  showDeletedIncidentCategory
} = require("../views/incidentCategoriesView");

const getAllIncidentCategories = async (req, res, next) => {
  try {
    const categories = await incidentCategoriesModel.getAll();
    showAllIncidentCategories(res, categories);
  } catch (error) {
    next(error);
  }
};

const getIncidentCategoryById = async (req, res, next) => {
  try {
    const category = await incidentCategoriesModel.getById(req.params.id);

    if (!category) {
      const error = new Error("Incident category not found");
      error.statusCode = 404;
      throw error;
    }

    showIncidentCategory(res, category);
  } catch (error) {
    next(error);
  }
};

const createIncidentCategory = async (req, res, next) => {
  try {
    const category = await incidentCategoriesModel.create(req.body);
    showIncidentCategory(res, category, 201);
  } catch (error) {
    next(error);
  }
};

const updateIncidentCategory = async (req, res, next) => {
  try {
    const existingCategory = await incidentCategoriesModel.getById(req.params.id);

    if (!existingCategory) {
      const error = new Error("Incident category not found");
      error.statusCode = 404;
      throw error;
    }

    const category = await incidentCategoriesModel.update(req.params.id, req.body);
    showIncidentCategory(res, category);
  } catch (error) {
    next(error);
  }
};

const deleteIncidentCategory = async (req, res, next) => {
  try {
    const deleted = await incidentCategoriesModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Incident category not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedIncidentCategory(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIncidentCategories,
  getIncidentCategoryById,
  createIncidentCategory,
  updateIncidentCategory,
  deleteIncidentCategory
};
