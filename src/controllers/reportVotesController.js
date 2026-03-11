const reportVotesModel = require("../models/reportVotesModel");
const {
  showAllReportVotes,
  showReportVote,
  showDeletedReportVote
} = require("../views/reportVotesView");

const getAllReportVotes = async (req, res, next) => {
  try {
    const votes = await reportVotesModel.getAll();
    showAllReportVotes(res, votes);
  } catch (error) {
    next(error);
  }
};

const getReportVoteById = async (req, res, next) => {
  try {
    const vote = await reportVotesModel.getById(req.params.id);

    if (!vote) {
      const error = new Error("Report vote not found");
      error.statusCode = 404;
      throw error;
    }

    showReportVote(res, vote);
  } catch (error) {
    next(error);
  }
};

const createReportVote = async (req, res, next) => {
  try {
    const vote = await reportVotesModel.create(req.body);
    showReportVote(res, vote, 201);
  } catch (error) {
    next(error);
  }
};

const updateReportVote = async (req, res, next) => {
  try {
    const existingVote = await reportVotesModel.getById(req.params.id);

    if (!existingVote) {
      const error = new Error("Report vote not found");
      error.statusCode = 404;
      throw error;
    }

    const vote = await reportVotesModel.update(req.params.id, req.body);
    showReportVote(res, vote);
  } catch (error) {
    next(error);
  }
};

const deleteReportVote = async (req, res, next) => {
  try {
    const deleted = await reportVotesModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Report vote not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedReportVote(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReportVotes,
  getReportVoteById,
  createReportVote,
  updateReportVote,
  deleteReportVote
};
