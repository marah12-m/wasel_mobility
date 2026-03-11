const reportsModel = require("../models/reportsModel");
const { showAllReports, showReport, showDeletedReport } = require("../views/reportsView");

const getAllReports = async (req, res, next) => {
  try {
    const reports = await reportsModel.getAll();
    showAllReports(res, reports);
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await reportsModel.getById(req.params.id);

    if (!report) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }

    showReport(res, report);
  } catch (error) {
    next(error);
  }
};

const createReport = async (req, res, next) => {
  try {
    const report = await reportsModel.create(req.body);
    showReport(res, report, 201);
  } catch (error) {
    next(error);
  }
};

const updateReport = async (req, res, next) => {
  try {
    const existingReport = await reportsModel.getById(req.params.id);

    if (!existingReport) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }

    const report = await reportsModel.update(req.params.id, req.body);
    showReport(res, report);
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const deleted = await reportsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Report not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedReport(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
};
