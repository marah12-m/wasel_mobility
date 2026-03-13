const createCrudController = require("./createCrudController");
const checkpointsService = require("../services/checkpointsService");
const {
  showAllCheckpoints,
  showCheckpoint,
  showDeletedCheckpoint
} = require("../views/checkpointsView");

const controller = createCrudController({
  service: checkpointsService,
  views: {
    showAll: showAllCheckpoints,
    showOne: showCheckpoint,
    showDeleted: showDeletedCheckpoint
  }
});

module.exports = {
  getAllCheckpoints: controller.getAll,
  getCheckpointById: controller.getById,
  createCheckpoint: controller.create,
  updateCheckpoint: controller.update,
  deleteCheckpoint: controller.remove
};
