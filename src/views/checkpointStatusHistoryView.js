const showAllCheckpointStatusHistory = (res, history) => {
  res.json({ success: true, data: history });
};

const showCheckpointStatusHistory = (res, item, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: item });
};

const showDeletedCheckpointStatusHistory = (res, id) => {
  res.json({ success: true, message: "Checkpoint status history deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllCheckpointStatusHistory,
  showCheckpointStatusHistory,
  showDeletedCheckpointStatusHistory
};
