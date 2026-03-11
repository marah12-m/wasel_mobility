const showAllIncidents = (res, incidents) => {
  res.json({ success: true, data: incidents });
};

const showIncident = (res, incident, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: incident });
};

const showDeletedIncident = (res, id) => {
  res.json({ success: true, message: "Incident deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllIncidents,
  showIncident,
  showDeletedIncident
};
