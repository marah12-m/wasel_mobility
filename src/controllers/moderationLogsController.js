const moderationLogsModel = require("../models/moderationLogsModel");
const {
  showAllModerationLogs,
  showModerationLog,
  showDeletedModerationLog
} = require("../views/moderationLogsView");

const getAllModerationLogs = async (req, res, next) => {
  try {
    const logs = await moderationLogsModel.getAll();
    showAllModerationLogs(res, logs);
  } catch (error) {
    next(error);
  }
};

const getModerationLogById = async (req, res, next) => {
  try {
    const log = await moderationLogsModel.getById(req.params.id);

    if (!log) {
      const error = new Error("Moderation log not found");
      error.statusCode = 404;
      throw error;
    }

    showModerationLog(res, log);
  } catch (error) {
    next(error);
  }
};

const createModerationLog = async (req, res, next) => {
  try {
    const log = await moderationLogsModel.create(req.body);
    showModerationLog(res, log, 201);
  } catch (error) {
    next(error);
  }
};

const updateModerationLog = async (req, res, next) => {
  try {
    const existingLog = await moderationLogsModel.getById(req.params.id);

    if (!existingLog) {
      const error = new Error("Moderation log not found");
      error.statusCode = 404;
      throw error;
    }

    const log = await moderationLogsModel.update(req.params.id, req.body);
    showModerationLog(res, log);
  } catch (error) {
    next(error);
  }
};

const deleteModerationLog = async (req, res, next) => {
  try {
    const deleted = await moderationLogsModel.remove(req.params.id);

    if (!deleted) {
      const error = new Error("Moderation log not found");
      error.statusCode = 404;
      throw error;
    }

    showDeletedModerationLog(res, req.params.id);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllModerationLogs,
  getModerationLogById,
  createModerationLog,
  updateModerationLog,
  deleteModerationLog
};
