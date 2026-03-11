const showAllIncidentCategories = (res, categories) => {
  res.json({ success: true, data: categories });
};

const showIncidentCategory = (res, category, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: category });
};

const showDeletedIncidentCategory = (res, id) => {
  res.json({ success: true, message: "Incident category deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllIncidentCategories,
  showIncidentCategory,
  showDeletedIncidentCategory
};
