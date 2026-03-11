const showAllCheckpoints = (res, checkpoints) => {
  res.json({ success: true, data: checkpoints });
};

const showCheckpoint = (res, checkpoint, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: checkpoint });
};

const showDeletedCheckpoint = (res, id) => {
  res.json({ success: true, message: "Checkpoint deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllCheckpoints,
  showCheckpoint,
  showDeletedCheckpoint
};
