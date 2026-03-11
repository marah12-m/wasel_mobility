const showAllAlerts = (res, alerts) => {
  res.json({ success: true, data: alerts });
};

const showAlert = (res, alert, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: alert });
};

const showDeletedAlert = (res, id) => {
  res.json({ success: true, message: "Alert deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllAlerts,
  showAlert,
  showDeletedAlert
};
