const showAllModerationLogs = (res, logs) => {
  res.json({ success: true, data: logs });
};

const showModerationLog = (res, log, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: log });
};

const showDeletedModerationLog = (res, id) => {
  res.json({ success: true, message: "Moderation log deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllModerationLogs,
  showModerationLog,
  showDeletedModerationLog
};
