const createCrudController = require("./createCrudController");
const checkpointStatusHistoryService = require("../services/checkpointStatusHistoryService");
const {
  showAllCheckpointStatusHistory,
  showCheckpointStatusHistory,
  showDeletedCheckpointStatusHistory
} = require("../views/checkpointStatusHistoryView");

const controller = createCrudController({
  service: checkpointStatusHistoryService,
  views: {
    showAll: showAllCheckpointStatusHistory,
    showOne: showCheckpointStatusHistory,
    showDeleted: showDeletedCheckpointStatusHistory
  }
});

module.exports = {
  getAllCheckpointStatusHistory: controller.getAll,
  getCheckpointStatusHistoryById: controller.getById,
  createCheckpointStatusHistory: controller.create,
  updateCheckpointStatusHistory: controller.update,
  deleteCheckpointStatusHistory: controller.remove
};
