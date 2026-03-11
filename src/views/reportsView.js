const showAllReports = (res, reports) => {
  res.json({ success: true, data: reports });
};

const showReport = (res, report, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data: report });
};

const showDeletedReport = (res, id) => {
  res.json({ success: true, message: "Report deleted", data: { id: Number(id) } });
};

module.exports = {
  showAllReports,
  showReport,
  showDeletedReport
};
