const checkpointsModel = require("../models/checkpointsModel");
const {
  showAllCheckpoints,
  showCheckpoint,
  showDeletedCheckpoint
} = require("../views/checkpointsView");

const getAllCheckpoints = async (req, res, next) => {
  try {
    const checkpoints = await checkpointsModel.getAll();
    showAllCheckpoints(res, checkpoints);
  } catch (error) {
    next(error);
  }
};

const getCheckpointById = async (req, res, next) => {
  try {
    const checkpoint = await checkpointsModel.getById(req.params.id);

    if (!checkpoint) {
      const error = new Error("Checkpoint not found");
      error.statusCode = 404;
      throw error;
    }

    showCheckpoint(res, checkpoint);
  } catch (error) {
    next(error);
  }
};

const createCheckpoint = async (req, res, next) => {
  try {
    const checkpoint = await checkpointsModel.create(req.body);
    showCheckpoint(res, checkpoint, 201);
  } catch (error) {
    next(error);
  }
};

const updateCheckpoint = async (req, res, next) => {
  try {
    const existingCheckpoint = await checkpointsModel.getById(req.params.id);

    if (!existingCheckpoint) {
      const error = new Error("Checkpoint not found");
      error.statusCode = 404;
      throw error;
    }

    const checkpoint = await checkpointsModel.update(req.params.id, req.body);
    showCheckpoint(res, checkpoint);
  } catch (error) {
    next(error);
  }
};

const deleteCheckpoint = async (req, res, next) => {
  try {
    const deleted = await checkpointsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Checkpoint not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedCheckpoint(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCheckpoints,
  getCheckpointById,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint
};
