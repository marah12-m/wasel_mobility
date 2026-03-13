const createCrudController = require("./createCrudController");
const reportsService = require("../services/reportsService");
const { showAllReports, showReport, showDeletedReport } = require("../views/reportsView");

const controller = createCrudController({
  service: reportsService,
  views: {
    showAll: showAllReports,
    showOne: showReport,
    showDeleted: showDeletedReport
  }
});

module.exports = {
  getAllReports: controller.getAll,
  getReportById: controller.getById,
  createReport: controller.create,
  updateReport: controller.update,
  deleteReport: controller.remove
};
