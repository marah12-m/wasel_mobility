const createCrudController = require("./createCrudController");
const reportVotesService = require("../services/reportVotesService");
const {
  showAllReportVotes,
  showReportVote,
  showDeletedReportVote
} = require("../views/reportVotesView");

const controller = createCrudController({
  service: reportVotesService,
  views: {
    showAll: showAllReportVotes,
    showOne: showReportVote,
    showDeleted: showDeletedReportVote
  }
});

module.exports = {
  getAllReportVotes: controller.getAll,
  getReportVoteById: controller.getById,
  createReportVote: controller.create,
  updateReportVote: controller.update,
  deleteReportVote: controller.remove
};
