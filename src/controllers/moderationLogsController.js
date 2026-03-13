const createCrudController = require("./createCrudController");
const moderationLogsService = require("../services/moderationLogsService");
const {
  showAllModerationLogs,
  showModerationLog,
  showDeletedModerationLog
} = require("../views/moderationLogsView");

const controller = createCrudController({
  service: moderationLogsService,
  views: {
    showAll: showAllModerationLogs,
    showOne: showModerationLog,
    showDeleted: showDeletedModerationLog
  }
});

module.exports = {
  getAllModerationLogs: controller.getAll,
  getModerationLogById: controller.getById,
  createModerationLog: controller.create,
  updateModerationLog: controller.update,
  deleteModerationLog: controller.remove
};
