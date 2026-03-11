const checkpointStatusHistoryModel = require("../models/checkpointStatusHistoryModel");
const {
  showAllCheckpointStatusHistory,
  showCheckpointStatusHistory,
  showDeletedCheckpointStatusHistory
} = require("../views/checkpointStatusHistoryView");

const getAllCheckpointStatusHistory = async (req, res, next) => {
  try {
    const history = await checkpointStatusHistoryModel.getAll();
    showAllCheckpointStatusHistory(res, history);
  } catch (error) {
    next(error);
  }
};

const getCheckpointStatusHistoryById = async (req, res, next) => {
  try {
    const item = await checkpointStatusHistoryModel.getById(req.params.id);

    if (!item) {
      const error = new Error("Checkpoint status history not found");
      error.statusCode = 404;
      throw error;
    }

    showCheckpointStatusHistory(res, item);
  } catch (error) {
    next(error);
  }
};

const createCheckpointStatusHistory = async (req, res, next) => {
  try {
    const item = await checkpointStatusHistoryModel.create(req.body);
    showCheckpointStatusHistory(res, item, 201);
  } catch (error) {
    next(error);
  }
};

const updateCheckpointStatusHistory = async (req, res, next) => {
  try {
    const existingItem = await checkpointStatusHistoryModel.getById(req.params.id);

    if (!existingItem) {
      const error = new Error("Checkpoint status history not found");
      error.statusCode = 404;
      throw error;
    }

    const item = await checkpointStatusHistoryModel.update(req.params.id, req.body);
    showCheckpointStatusHistory(res, item);
  } catch (error) {
    next(error);
  }
};

const deleteCheckpointStatusHistory = async (req, res, next) => {
  try {
    const deleted = await checkpointStatusHistoryModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Checkpoint status history not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedCheckpointStatusHistory(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCheckpointStatusHistory,
  getCheckpointStatusHistoryById,
  createCheckpointStatusHistory,
  updateCheckpointStatusHistory,
  deleteCheckpointStatusHistory
};
